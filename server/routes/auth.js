import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../database.js";

const router = Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "perception-training-secret-key-2024";

router.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "用户名和密码不能为空" });
    }

    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: "用户名长度应在2-20个字符之间" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "密码长度至少6位" });
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username);

    if (existingUser) {
      return res.status(400).json({ error: "用户名已存在" });
    }

    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(
      "INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)",
    ).run(id, username, passwordHash);

    const token = jwt.sign({ id, username, role: "user" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: { id, username },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "注册失败" });
  }
});

router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "用户名和密码不能为空" });
    }

    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: "user" },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "登录失败" });
  }
});

router.get("/verify", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未授权", valid: false });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ valid: true, user: decoded });
    } catch (e) {
      res.status(401).json({ error: "令牌无效或已过期", valid: false });
    }
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ error: "验证失败", valid: false });
  }
});

router.post("/admin/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "用户名和密码不能为空" });
    }

    const admin = db
      .prepare("SELECT * FROM admin WHERE username = ?")
      .get(username);

    if (!admin) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    const isValid = bcrypt.compareSync(password, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "登录失败" });
  }
});

router.post("/admin/setup", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "用户名和密码不能为空" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "密码长度至少6位" });
    }

    const existingAdmin = db.prepare("SELECT id FROM admin LIMIT 1").get();

    if (existingAdmin) {
      return res.status(400).json({ error: "管理员已存在，请使用登录功能" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    db.prepare(
      "INSERT INTO admin (id, username, password_hash) VALUES (?, ?, ?)",
    ).run(id, username, passwordHash);

    const token = jwt.sign({ id, username, role: "admin" }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      success: true,
      token,
      admin: { id, username },
    });
  } catch (error) {
    console.error("Setup error:", error);
    res.status(500).json({ error: "初始化失败" });
  }
});

router.post("/admin/change-password", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未授权" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: "令牌无效或已过期" });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "旧密码和新密码不能为空" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "新密码长度至少6位" });
    }

    const admin = db
      .prepare("SELECT * FROM admin WHERE id = ?")
      .get(decoded.id);

    if (!admin) {
      return res.status(404).json({ error: "管理员不存在" });
    }

    const isValid = bcrypt.compareSync(oldPassword, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "旧密码错误" });
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE admin SET password_hash = ? WHERE id = ?").run(
      newPasswordHash,
      decoded.id,
    );

    res.json({ success: true, message: "密码修改成功" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "密码修改失败" });
  }
});

router.get("/admin/check-setup", (req, res) => {
  try {
    const admin = db.prepare("SELECT id FROM admin LIMIT 1").get();
    res.json({ setupRequired: !admin });
  } catch (error) {
    console.error("Check setup error:", error);
    res.status(500).json({ error: "检查失败" });
  }
});

router.get("/admin/verify", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "未授权", valid: false });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role !== "admin") {
        return res.status(401).json({ error: "非管理员", valid: false });
      }
      res.json({ valid: true, admin: decoded });
    } catch (e) {
      res.status(401).json({ error: "令牌无效或已过期", valid: false });
    }
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ error: "验证失败", valid: false });
  }
});

export default router;
