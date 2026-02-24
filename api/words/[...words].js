import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey)
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const supabase = getSupabase()
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname

  try {
    // 获取统计数据
    if (req.method === 'GET' && pathname.endsWith('/stats')) {
      const { count: wordCount } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
      
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      const { count: recordCount } = await supabase
        .from('training_records')
        .select('*', { count: 'exact', head: true })
      
      return res.json({
        success: true,
        stats: {
          wordCount: wordCount || 0,
          userCount: userCount || 0,
          recordCount: recordCount || 0
        }
      })
    }

    // 获取所有词语
    if (req.method === 'GET' && pathname.endsWith('/list')) {
      const { data: words, error } = await supabase
        .from('words')
        .select(`*, synonyms (synonym)`)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const result = words.map(w => ({
        id: w.id,
        word: w.word,
        category: w.category,
        synonyms: w.synonyms?.map(s => s.synonym) || [],
        createdAt: w.created_at
      }))
      
      return res.json({ success: true, words: result })
    }

    // 添加词语
    if (req.method === 'POST' && pathname.endsWith('/add')) {
      const { word, category, synonyms } = req.body
      
      if (!word) {
        return res.status(400).json({ success: false, error: '词语不能为空' })
      }
      
      const id = crypto.randomUUID()
      const { data, error } = await supabase
        .from('words')
        .insert([{ id, word, category: category || 'general', created_at: new Date().toISOString() }])
        .select()
        .single()
      
      if (error) throw error
      
      if (synonyms && synonyms.length > 0) {
        const synonymData = synonyms.map(s => ({
          id: crypto.randomUUID(),
          word_id: id,
          synonym: s
        }))
        await supabase.from('synonyms').insert(synonymData)
      }
      
      return res.json({ success: true, word: { ...data, synonyms: synonyms || [] } })
    }

    // 更新词语
    if (req.method === 'PUT' && pathname.includes('/update/')) {
      const id = pathname.split('/update/')[1]?.split('/')[0]
      const { word, category, synonyms } = req.body
      
      const { error } = await supabase
        .from('words')
        .update({ word, category, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      
      await supabase.from('synonyms').delete().eq('word_id', id)
      
      if (synonyms && synonyms.length > 0) {
        const synonymData = synonyms.map(s => ({
          id: crypto.randomUUID(),
          word_id: id,
          synonym: s
        }))
        await supabase.from('synonyms').insert(synonymData)
      }
      
      return res.json({ success: true })
    }

    // 删除词语
    if (req.method === 'DELETE' && pathname.includes('/delete/')) {
      const id = pathname.split('/delete/')[1]?.split('/')[0]
      
      await supabase.from('synonyms').delete().eq('word_id', id)
      
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      return res.json({ success: true })
    }

    // 批量导入词语
    if (req.method === 'POST' && pathname.endsWith('/batch-import')) {
      const { words } = req.body
      
      if (!words || !Array.isArray(words) || words.length === 0) {
        return res.status(400).json({ success: false, error: '词语列表不能为空' })
      }
      
      const wordData = words.map(w => ({
        id: crypto.randomUUID(),
        word: w.word,
        category: w.category || 'general',
        created_at: new Date().toISOString()
      }))
      
      const { error } = await supabase.from('words').insert(wordData)
      
      if (error) throw error
      
      return res.json({ success: true, count: words.length })
    }

    return res.status(404).json({ error: 'Not found' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ success: false, error: '服务器错误' })
  }
}
