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
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // 保存训练记录
    if (req.method === "POST" && pathname.endsWith("/record")) {
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

      const id = crypto.randomUUID();
      const { data, error } = await supabase
        .from("training_records")
        .insert([
          {
            id,
            user_id: userId,
            difficulty,
            table_words: tableWords,
            accuracy,
            correct_count: correctCount,
            total_time: totalTime,
            avg_time: avgTime,
            details: JSON.stringify(details),
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return res.json({ success: true, record: data });
    }

    // 获取所有训练记录（管理员）
    if (
      req.method === "GET" &&
      pathname.endsWith("/records") &&
      !pathname.includes("/records/")
    ) {
      const { data, error } = await supabase
        .from("training_records")
        .select(`*, users (username)`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const records = data.map((r) => ({
        ...r,
        username: r.users?.username || "未知用户",
        tableWords: r.table_words,
        correctCount: r.correct_count,
        totalTime: r.total_time,
        avgTime: r.avg_time,
        details:
          typeof r.details === "string" ? JSON.parse(r.details) : r.details,
      }));

      return res.json({ success: true, records });
    }

    // 获取用户训练记录
    if (req.method === "GET" && pathname.includes("/records/")) {
      const userId = pathname.split("/records/")[1]?.split("/")[0];

      const { data, error } = await supabase
        .from("training_records")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const records = data.map((r) => ({
        ...r,
        tableWords: r.table_words,
        correctCount: r.correct_count,
        totalTime: r.total_time,
        avgTime: r.avg_time,
        details:
          typeof r.details === "string" ? JSON.parse(r.details) : r.details,
      }));

      return res.json({ success: true, records });
    }

    // 删除训练记录
    if (req.method === "DELETE" && pathname.includes("/record/")) {
      const id = pathname.split("/record/")[1]?.split("/")[0];

      const { error } = await supabase
        .from("training_records")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return res.json({ success: true });
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ success: false, error: "服务器错误" });
  }
}
