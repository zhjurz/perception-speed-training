import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const app = express()
app.use(cors())
app.use(express.json())

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// 获取所有词语
app.get('/list', async (req, res) => {
  try {
    const { data: words, error } = await supabase
      .from('words')
      .select(`
        *,
        synonyms (synonym)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    const result = words.map(w => ({
      id: w.id,
      word: w.word,
      category: w.category,
      synonyms: w.synonyms?.map(s => s.synonym) || [],
      createdAt: w.created_at
    }))
    
    res.json({ success: true, words: result })
  } catch (error) {
    console.error('Get words error:', error)
    res.status(500).json({ success: false, error: '获取词语失败' })
  }
})

// 添加词语
app.post('/add', async (req, res) => {
  const { word, category, synonyms } = req.body
  
  if (!word) {
    return res.status(400).json({ success: false, error: '词语不能为空' })
  }
  
  try {
    const id = crypto.randomUUID()
    const { data, error } = await supabase
      .from('words')
      .insert([{ id, word, category: category || 'general', created_at: new Date().toISOString() }])
      .select()
      .single()
    
    if (error) throw error
    
    // 添加同义词
    if (synonyms && synonyms.length > 0) {
      const synonymData = synonyms.map(s => ({
        id: crypto.randomUUID(),
        word_id: id,
        synonym: s
      }))
      await supabase.from('synonyms').insert(synonymData)
    }
    
    res.json({ success: true, word: { ...data, synonyms: synonyms || [] } })
  } catch (error) {
    console.error('Add word error:', error)
    res.status(500).json({ success: false, error: '添加词语失败' })
  }
})

// 更新词语
app.put('/update/:id', async (req, res) => {
  const { id } = req.params
  const { word, category, synonyms } = req.body
  
  try {
    const { error } = await supabase
      .from('words')
      .update({ word, category, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
    
    // 更新同义词：先删除再添加
    await supabase.from('synonyms').delete().eq('word_id', id)
    
    if (synonyms && synonyms.length > 0) {
      const synonymData = synonyms.map(s => ({
        id: crypto.randomUUID(),
        word_id: id,
        synonym: s
      }))
      await supabase.from('synonyms').insert(synonymData)
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Update word error:', error)
    res.status(500).json({ success: false, error: '更新词语失败' })
  }
})

// 删除词语
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params
  
  try {
    // 先删除同义词
    await supabase.from('synonyms').delete().eq('word_id', id)
    
    // 再删除词语
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    res.json({ success: true })
  } catch (error) {
    console.error('Delete word error:', error)
    res.status(500).json({ success: false, error: '删除词语失败' })
  }
})

// 批量导入词语
app.post('/batch-import', async (req, res) => {
  const { words } = req.body
  
  if (!words || !Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ success: false, error: '词语列表不能为空' })
  }
  
  try {
    const wordData = words.map(w => ({
      id: crypto.randomUUID(),
      word: w.word,
      category: w.category || 'general',
      created_at: new Date().toISOString()
    }))
    
    const { error } = await supabase.from('words').insert(wordData)
    
    if (error) throw error
    
    res.json({ success: true, count: words.length })
  } catch (error) {
    console.error('Batch import error:', error)
    res.status(500).json({ success: false, error: '批量导入失败' })
  }
})

// 获取统计数据
app.get('/stats', async (req, res) => {
  try {
    const { count: wordCount } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
    
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const { count: recordCount } = await supabase
      .from('training_records')
      .select('*', { count: 'exact', head: true })
    
    res.json({
      success: true,
      stats: {
        wordCount: wordCount || 0,
        userCount: userCount || 0,
        recordCount: recordCount || 0
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ success: false, error: '获取统计失败' })
  }
})

export default app
