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

// ==================== 用户认证 ====================

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.status(400).json({ success: false, error: '用户名和密码不能为空' })
  }
  
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ success: false, error: '用户名长度应在2-20个字符之间' })
  }
  
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: '密码长度至少6位' })
  }
  
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()
    
    if (existingUser) {
      return res.status(400).json({ success: false, error: '用户名已存在' })
    }
    
    const id = crypto.randomUUID()
    const { data, error } = await supabase
      .from('users')
      .insert([{ id, username, password, created_at: new Date().toISOString() }])
      .select()
      .single()
    
    if (error) throw error
    
    const token = crypto.randomBytes(32).toString('hex')
    await supabase.from('tokens').insert([{ user_id: id, token, type: 'user' }])
    
    res.json({ success: true, user: { id: data.id, username: data.username }, token })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, error: '注册失败' })
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .eq('password', password)
      .single()
    
    if (!user) {
      return res.status(401).json({ success: false, error: '用户名或密码错误' })
    }
    
    const token = crypto.randomBytes(32).toString('hex')
    await supabase.from('tokens').insert([{ user_id: user.id, token, type: 'user' }])
    
    res.json({ success: true, user, token })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: '登录失败' })
  }
})

// ==================== 管理员认证 ====================

app.get('/admin/check-setup', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('admins')
      .select('*', { count: 'exact', head: true })
    
    res.json({ setupRequired: count === 0 })
  } catch (error) {
    res.json({ setupRequired: true })
  }
})

app.post('/admin/setup', async (req, res) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.status(400).json({ success: false, error: '用户名和密码不能为空' })
  }
  
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: '密码长度至少6位' })
  }
  
  try {
    const { count } = await supabase
      .from('admins')
      .select('*', { count: 'exact', head: true })
    
    if (count > 0) {
      return res.status(400).json({ success: false, error: '管理员已存在' })
    }
    
    const id = crypto.randomUUID()
    const { data, error } = await supabase
      .from('admins')
      .insert([{ id, username, password, created_at: new Date().toISOString() }])
      .select()
      .single()
    
    if (error) throw error
    
    const token = crypto.randomBytes(32).toString('hex')
    await supabase.from('tokens').insert([{ user_id: id, token, type: 'admin' }])
    
    res.json({ success: true, admin: { id: data.id, username: data.username }, token })
  } catch (error) {
    console.error('Admin setup error:', error)
    res.status(500).json({ success: false, error: '设置失败' })
  }
})

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body
  
  try {
    const { data: admin } = await supabase
      .from('admins')
      .select('id, username')
      .eq('username', username)
      .eq('password', password)
      .single()
    
    if (!admin) {
      return res.status(401).json({ success: false, error: '用户名或密码错误' })
    }
    
    const token = crypto.randomBytes(32).toString('hex')
    await supabase.from('tokens').insert([{ user_id: admin.id, token, type: 'admin' }])
    
    res.json({ success: true, admin, token })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ success: false, error: '登录失败' })
  }
})

export default app
