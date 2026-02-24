import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../database.js";

const router = Router();

router.post("/record", (req, res) => {
  try {
    const {
      userId,
      difficulty,
      tableWords,
      accuracy,
      correctCount,
      totalTime,
      avgTime,
      details,
    } = req.body;

    if (!userId || !tableWords || accuracy === undefined) {
      return res.status(400).json({ error: "缺少必要参数" });
    }

    const recordId = uuidv4();

    const insertRecord = db.prepare(`
      INSERT INTO training_records 
      (id, user_id, difficulty, table_words, accuracy, correct_count, total_time, avg_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertDetail = db.prepare(`
      INSERT INTO training_details
      (id, record_id, question_index, question_words, user_answer, correct_answer, time_spent, is_correct)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      insertRecord.run(
        recordId,
        userId,
        difficulty,
        JSON.stringify(tableWords),
        accuracy,
        correctCount,
        totalTime,
        avgTime,
      );

      if (Array.isArray(details)) {
        details.forEach((detail) => {
          insertDetail.run(
            uuidv4(),
            recordId,
            detail.questionIndex,
            JSON.stringify(detail.questionWords),
            detail.userAnswer,
            detail.correctAnswer,
            detail.timeSpent,
            detail.isCorrect ? 1 : 0,
          );
        });
      }
    });

    transaction();

    res.json({ success: true, recordId });
  } catch (error) {
    console.error("Save record error:", error);
    res.status(500).json({ error: "保存记录失败" });
  }
});

router.get("/records/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const records = db
      .prepare(
        `
      SELECT * FROM training_records 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `,
      )
      .all(userId, parseInt(limit), parseInt(offset));

    const total = db
      .prepare(
        "SELECT COUNT(*) as count FROM training_records WHERE user_id = ?",
      )
      .get(userId).count;

    const formattedRecords = records.map((record) => ({
      ...record,
      table_words: JSON.parse(record.table_words),
    }));

    res.json({ records: formattedRecords, total });
  } catch (error) {
    console.error("Get records error:", error);
    res.status(500).json({ error: "获取记录失败" });
  }
});

router.get("/record/:recordId", (req, res) => {
  try {
    const { recordId } = req.params;

    const record = db
      .prepare(
        `
      SELECT r.*, u.username
      FROM training_records r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `,
      )
      .get(recordId);

    if (!record) {
      return res.status(404).json({ error: "记录不存在" });
    }

    const details = db
      .prepare(
        "SELECT * FROM training_details WHERE record_id = ? ORDER BY question_index",
      )
      .all(recordId);

    res.json({
      ...record,
      table_words: JSON.parse(record.table_words),
      details: details.map((d) => ({
        ...d,
        question_words: JSON.parse(d.question_words),
        is_correct: !!d.is_correct,
      })),
    });
  } catch (error) {
    console.error("Get record detail error:", error);
    res.status(500).json({ error: "获取记录详情失败" });
  }
});

router.delete("/record/:recordId", (req, res) => {
  try {
    const { recordId } = req.params;

    const record = db
      .prepare("SELECT id FROM training_records WHERE id = ?")
      .get(recordId);

    if (!record) {
      return res.status(404).json({ error: "记录不存在" });
    }

    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM training_details WHERE record_id = ?").run(
        recordId,
      );
      db.prepare("DELETE FROM training_records WHERE id = ?").run(recordId);
    });

    transaction();

    res.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("Delete record error:", error);
    res.status(500).json({ error: "删除失败" });
  }
});

router.get("/stats/:userId", (req, res) => {
  try {
    const { userId } = req.params;

    const stats = db
      .prepare(
        `
      SELECT 
        COUNT(*) as total_sessions,
        AVG(accuracy) as avg_accuracy,
        AVG(total_time) as avg_total_time,
        AVG(avg_time) as avg_question_time,
        MAX(accuracy) as best_accuracy,
        MIN(total_time) as best_time
      FROM training_records 
      WHERE user_id = ?
    `,
      )
      .get(userId);

    const recentStats = db
      .prepare(
        `
      SELECT 
        COUNT(*) as sessions,
        AVG(accuracy) as avg_accuracy,
        AVG(total_time) as avg_total_time
      FROM training_records 
      WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
    `,
      )
      .get(userId);

    const difficultyStats = db
      .prepare(
        `
      SELECT 
        difficulty,
        COUNT(*) as count,
        AVG(accuracy) as avg_accuracy
      FROM training_records 
      WHERE user_id = ?
      GROUP BY difficulty
    `,
      )
      .all(userId);

    res.json({
      overall: stats,
      recentWeek: recentStats,
      byDifficulty: difficultyStats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "获取统计失败" });
  }
});

router.get("/admin/all-records", (req, res) => {
  try {
    const { limit = 50, offset = 0, userId, startDate, endDate } = req.query;

    let query = `
      SELECT r.*, u.username
      FROM training_records r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += " AND r.user_id = ?";
      params.push(userId);
    }

    if (startDate) {
      query += " AND r.created_at >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND r.created_at <= ?";
      params.push(endDate);
    }

    const countQuery = query.replace(
      "SELECT r.*, u.username",
      "SELECT COUNT(*) as count",
    );
    const total = db.prepare(countQuery).get(...params).count;

    query += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const records = db.prepare(query).all(...params);

    res.json({
      records: records.map((r) => ({
        ...r,
        table_words: JSON.parse(r.table_words),
      })),
      total,
    });
  } catch (error) {
    console.error("Get all records error:", error);
    res.status(500).json({ error: "获取记录失败" });
  }
});

router.get("/admin/users", (req, res) => {
  try {
    const users = db
      .prepare(
        `
      SELECT 
        u.id,
        u.username,
        u.created_at,
        COUNT(r.id) as total_sessions,
        AVG(r.accuracy) as avg_accuracy,
        MAX(r.created_at) as last_training
      FROM users u
      LEFT JOIN training_records r ON u.id = r.user_id
      GROUP BY u.id
      ORDER BY last_training DESC
    `,
      )
      .all();

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "获取用户列表失败" });
  }
});

router.delete("/admin/user/:userId", (req, res) => {
  try {
    const { userId } = req.params;

    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);

    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }

    const transaction = db.transaction(() => {
      const recordIds = db
        .prepare("SELECT id FROM training_records WHERE user_id = ?")
        .all(userId)
        .map((r) => r.id);

      recordIds.forEach((recordId) => {
        db.prepare("DELETE FROM training_details WHERE record_id = ?").run(
          recordId,
        );
      });

      db.prepare("DELETE FROM training_records WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    });

    transaction();

    res.json({ success: true, message: "用户删除成功" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "删除用户失败" });
  }
});

router.get("/admin/overview", (req, res) => {
  try {
    const totalUsers = db
      .prepare("SELECT COUNT(*) as count FROM users")
      .get().count;
    const totalRecords = db
      .prepare("SELECT COUNT(*) as count FROM training_records")
      .get().count;
    const avgAccuracy =
      db.prepare("SELECT AVG(accuracy) as avg FROM training_records").get()
        .avg || 0;
    const todayRecords = db
      .prepare(
        `
      SELECT COUNT(*) as count FROM training_records 
      WHERE date(created_at) = date('now')
    `,
      )
      .get().count;

    res.json({
      totalUsers,
      totalRecords,
      avgAccuracy: avgAccuracy.toFixed(1),
      todayRecords,
    });
  } catch (error) {
    console.error("Get overview error:", error);
    res.status(500).json({ error: "获取概览失败" });
  }
});

export default router;
