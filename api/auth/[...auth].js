import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const supabase = getSupabase();
  const path = req.url.split("/").filter(Boolean);
  const action = path[path.length - 1] || "";

  try {
    // 用户注册
    if (req.method === "POST" && action === "register") {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ success: false, error: "用户名和密码不能为空" });
      }

      if (username.length < 2 || username.length > 20) {
        return res
          .status(400)
          .json({ success: false, error: "用户名长度应在2-20个字符之间" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ success: false, error: "密码长度至少6位" });
      }

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (existingUser) {
        return res.status(400).json({ success: false, error: "用户名已存在" });
      }

      const id = crypto.randomUUID();
      const { data, error } = await supabase
        .from("users")
        .insert([
          { id, username, password, created_at: new Date().toISOString() },
        ])
        .select()
        .single();

      if (error) throw error;

      const token = crypto.randomBytes(32).toString("hex");
      await supabase
        .from("tokens")
        .insert([{ user_id: id, token, type: "user" }]);

      return res.json({
        success: true,
        user: { id: data.id, username: data.username },
        token,
      });
    }

    // 用户登录
    if (req.method === "POST" && action === "login") {
      const { username, password } = req.body;

      const { data: user } = await supabase
        .from("users")
        .select("id, username")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (!user) {
        return res
          .status(401)
          .json({ success: false, error: "用户名或密码错误" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      await supabase
        .from("tokens")
        .insert([{ user_id: user.id, token, type: "user" }]);

      return res.json({ success: true, user, token });
    }

    // 检查管理员设置
    if (req.method === "GET" && req.url.includes("admin/check-setup")) {
      const { count } = await supabase
        .from("admins")
        .select("*", { count: "exact", head: true });

      return res.json({ setupRequired: count === 0 });
    }

    // 管理员设置
    if (req.method === "POST" && req.url.includes("admin/setup")) {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ success: false, error: "用户名和密码不能为空" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ success: false, error: "密码长度至少6位" });
      }

      const { count } = await supabase
        .from("admins")
        .select("*", { count: "exact", head: true });

      if (count > 0) {
        return res.status(400).json({ success: false, error: "管理员已存在" });
      }

      const id = crypto.randomUUID();
      const { data, error } = await supabase
        .from("admins")
        .insert([
          { id, username, password, created_at: new Date().toISOString() },
        ])
        .select()
        .single();

      if (error) throw error;

      const token = crypto.randomBytes(32).toString("hex");
      await supabase
        .from("tokens")
        .insert([{ user_id: id, token, type: "admin" }]);

      return res.json({
        success: true,
        admin: { id: data.id, username: data.username },
        token,
      });
    }

    // 管理员登录
    if (req.method === "POST" && req.url.includes("admin/login")) {
      const { username, password } = req.body;

      const { data: admin } = await supabase
        .from("admins")
        .select("id, username")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (!admin) {
        return res
          .status(401)
          .json({ success: false, error: "用户名或密码错误" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      await supabase
        .from("tokens")
        .insert([{ user_id: admin.id, token, type: "admin" }]);

      return res.json({ success: true, admin, token });
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ success: false, error: "服务器错误" });
  }
}
