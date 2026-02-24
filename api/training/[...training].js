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

// 保存训练记录
app.post('/record', async (req, res) => {
  const { userId, difficulty, tableWords, accuracy, correctCount, totalTime, avgTime, details } = req.body
  
  try {
    const id = crypto.randomUUID()
    const { data, error } = await supabase
      .from('training_records')
      .insert([{
        id,
        user_id: userId,
        difficulty,
        table_words: tableWords,
        accuracy,
        correct_count: correctCount,
        total_time: totalTime,
        avg_time: avgTime,
        details: JSON.stringify(details),
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    
    res.json({ success: true, record: data })
  } catch (error) {
    console.error('Save record error:', error)
    res.status(500).json({ success: false, error: '保存记录失败' })
  }
})

// 获取用户训练记录
app.get('/records/:userId', async (req, res) => {
  const { userId } = req.params
  
  try {
    const { data, error } = await supabase
      .from('training_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) throw error
    
    const records = data.map(r => ({
      ...r,
      tableWords: r.table_words,
      correctCount: r.correct_count,
      totalTime: r.total_time,
      avgTime: r.avg_time,
      details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details
    }))
    
    res.json({ success: true, records })
  } catch (error) {
    console.error('Get records error:', error)
    res.status(500).json({ success: false, error: '获取记录失败' })
  }
})

// 获取所有训练记录（管理员）
app.get('/records', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('training_records')
      .select(`
        *,
        users (username)
      `)
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) throw error
    
    const records = data.map(r => ({
      ...r,
      username: r.users?.username || '未知用户',
      tableWords: r.table_words,
      correctCount: r.correct_count,
      totalTime: r.total_time,
      avgTime: r.avg_time,
      details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details
    }))
    
    res.json({ success: true, records })
  } catch (error) {
    console.error('Get all records error:', error)
    res.status(500).json({ success: false, error: '获取记录失败' })
  }
})

// 删除训练记录
app.delete('/record/:id', async (req, res) => {
  const { id } = req.params
  
  try {
    const { error } = await supabase
      .from('training_records')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    res.json({ success: true })
  } catch (error) {
    console.error('Delete record error:', error)
    res.status(500).json({ success: false, error: '删除记录失败' })
  }
})

export default app
