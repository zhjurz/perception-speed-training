import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../database.js'

const router = Router()

router.get('/', (req, res) => {
  try {
    const { activeOnly = 'false' } = req.query
    
    let query = `
      SELECT w.*, 
        GROUP_CONCAT(DISTINCT s.synonym) as synonyms,
        GROUP_CONCAT(DISTINCT sw.similar_word) as similar_words
      FROM words w
      LEFT JOIN synonyms s ON w.id = s.word_id
      LEFT JOIN similar_words sw ON w.id = sw.word_id
    `
    
    if (activeOnly === 'true') {
      query += ' WHERE w.is_active = 1'
    }
    
    query += ' GROUP BY w.id ORDER BY w.created_at DESC'
    
    const words = db.prepare(query).all()
    
    const formattedWords = words.map(word => ({
      ...word,
      is_active: !!word.is_active,
      synonyms: word.synonyms ? word.synonyms.split(',') : [],
      similar_words: word.similar_words ? word.similar_words.split(',') : []
    }))
    
    res.json(formattedWords)
  } catch (error) {
    console.error('Get words error:', error)
    res.status(500).json({ error: '获取词库失败' })
  }
})

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    
    const word = db.prepare(`
      SELECT w.*, 
        GROUP_CONCAT(DISTINCT s.synonym) as synonyms,
        GROUP_CONCAT(DISTINCT sw.similar_word) as similar_words
      FROM words w
      LEFT JOIN synonyms s ON w.id = s.word_id
      LEFT JOIN similar_words sw ON w.id = sw.word_id
      WHERE w.id = ?
      GROUP BY w.id
    `).get(id)
    
    if (!word) {
      return res.status(404).json({ error: '词语不存在' })
    }
    
    res.json({
      ...word,
      is_active: !!word.is_active,
      synonyms: word.synonyms ? word.synonyms.split(',') : [],
      similar_words: word.similar_words ? word.similar_words.split(',') : []
    })
  } catch (error) {
    console.error('Get word error:', error)
    res.status(500).json({ error: '获取词语失败' })
  }
})

router.post('/', (req, res) => {
  try {
    const { word, category = 'general', synonyms = [], similar_words = [] } = req.body
    
    if (!word || word.length !== 2) {
      return res.status(400).json({ error: '词语必须为两个字' })
    }
    
    const existing = db.prepare('SELECT id FROM words WHERE word = ?').get(word)
    if (existing) {
      return res.status(400).json({ error: '词语已存在' })
    }
    
    const id = uuidv4()
    
    const insertWord = db.prepare('INSERT INTO words (id, word, category) VALUES (?, ?, ?)')
    const insertSynonym = db.prepare('INSERT INTO synonyms (id, word_id, synonym) VALUES (?, ?, ?)')
    const insertSimilar = db.prepare('INSERT INTO similar_words (id, word_id, similar_word) VALUES (?, ?, ?)')
    
    const transaction = db.transaction(() => {
      insertWord.run(id, word, category)
      
      synonyms.forEach(synonym => {
        if (synonym && synonym.trim()) {
          insertSynonym.run(uuidv4(), id, synonym.trim())
        }
      })
      
      similar_words.forEach(similar => {
        if (similar && similar.trim()) {
          insertSimilar.run(uuidv4(), id, similar.trim())
        }
      })
    })
    
    transaction()
    
    res.json({ success: true, id, word, category, synonyms, similar_words })
  } catch (error) {
    console.error('Create word error:', error)
    res.status(500).json({ error: '创建词语失败' })
  }
})

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { word, category, is_active, synonyms, similar_words } = req.body
    
    const existing = db.prepare('SELECT * FROM words WHERE id = ?').get(id)
    if (!existing) {
      return res.status(404).json({ error: '词语不存在' })
    }
    
    const updateWord = db.prepare('UPDATE words SET word = ?, category = ?, is_active = ? WHERE id = ?')
    const deleteSynonyms = db.prepare('DELETE FROM synonyms WHERE word_id = ?')
    const insertSynonym = db.prepare('INSERT INTO synonyms (id, word_id, synonym) VALUES (?, ?, ?)')
    const deleteSimilar = db.prepare('DELETE FROM similar_words WHERE word_id = ?')
    const insertSimilar = db.prepare('INSERT INTO similar_words (id, word_id, similar_word) VALUES (?, ?, ?)')
    
    const transaction = db.transaction(() => {
      updateWord.run(
        word || existing.word,
        category !== undefined ? category : existing.category,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        id
      )
      
      if (synonyms !== undefined) {
        deleteSynonyms.run(id)
        synonyms.forEach(synonym => {
          if (synonym && synonym.trim()) {
            insertSynonym.run(uuidv4(), id, synonym.trim())
          }
        })
      }
      
      if (similar_words !== undefined) {
        deleteSimilar.run(id)
        similar_words.forEach(similar => {
          if (similar && similar.trim()) {
            insertSimilar.run(uuidv4(), id, similar.trim())
          }
        })
      }
    })
    
    transaction()
    
    res.json({ success: true })
  } catch (error) {
    console.error('Update word error:', error)
    res.status(500).json({ error: '更新词语失败' })
  }
})

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    
    const existing = db.prepare('SELECT id FROM words WHERE id = ?').get(id)
    if (!existing) {
      return res.status(404).json({ error: '词语不存在' })
    }
    
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM synonyms WHERE word_id = ?').run(id)
      db.prepare('DELETE FROM similar_words WHERE word_id = ?').run(id)
      db.prepare('DELETE FROM words WHERE id = ?').run(id)
    })
    
    transaction()
    
    res.json({ success: true })
  } catch (error) {
    console.error('Delete word error:', error)
    res.status(500).json({ error: '删除词语失败' })
  }
})

router.post('/batch', (req, res) => {
  try {
    const { words } = req.body
    
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: '词语列表不能为空' })
    }
    
    const insertWord = db.prepare('INSERT OR IGNORE INTO words (id, word, category) VALUES (?, ?, ?)')
    
    const transaction = db.transaction(() => {
      words.forEach(item => {
        if (item.word && item.word.length === 2) {
          insertWord.run(uuidv4(), item.word, item.category || 'general')
        }
      })
    })
    
    transaction()
    
    res.json({ success: true, count: words.length })
  } catch (error) {
    console.error('Batch insert words error:', error)
    res.status(500).json({ error: '批量导入失败' })
  }
})

router.get('/stats/overview', (req, res) => {
  try {
    const totalWords = db.prepare('SELECT COUNT(*) as count FROM words').get().count
    const activeWords = db.prepare('SELECT COUNT(*) as count FROM words WHERE is_active = 1').get().count
    const totalSynonyms = db.prepare('SELECT COUNT(*) as count FROM synonyms').get().count
    const totalSimilar = db.prepare('SELECT COUNT(*) as count FROM similar_words').get().count
    
    res.json({
      totalWords,
      activeWords,
      inactiveWords: totalWords - activeWords,
      totalSynonyms,
      totalSimilar
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: '获取统计失败' })
  }
})

export default router
