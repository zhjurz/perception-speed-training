import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync, existsSync } from "fs";
import { randomUUID } from "crypto";
import db from "./database.js";
import authRoutes from "./routes/auth.js";
import wordsRoutes from "./routes/words.js";
import trainingRoutes from "./routes/training.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, "data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/words", wordsRoutes);
app.use("/api/training", trainingRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

initializeDefaultWords();

function initializeDefaultWords() {
  const count = db.prepare("SELECT COUNT(*) as count FROM words").get().count;

  if (count > 0) return;

  const defaultWords = [
    "学习",
    "工作",
    "生活",
    "时间",
    "空间",
    "思想",
    "精神",
    "文化",
    "知识",
    "智慧",
    "科学",
    "技术",
    "经济",
    "政治",
    "社会",
    "自然",
    "环境",
    "资源",
    "能源",
    "材料",
    "信息",
    "数据",
    "系统",
    "网络",
    "平台",
    "服务",
    "管理",
    "发展",
    "建设",
    "创新",
    "改革",
    "开放",
    "合作",
    "交流",
    "沟通",
    "教育",
    "培训",
    "研究",
    "探索",
    "发现",
    "理论",
    "实践",
    "经验",
    "方法",
    "手段",
    "目标",
    "计划",
    "方案",
    "措施",
    "策略",
    "问题",
    "困难",
    "挑战",
    "机遇",
    "风险",
    "质量",
    "效率",
    "效益",
    "效果",
    "成果",
    "能力",
    "素质",
    "水平",
    "标准",
    "规范",
    "制度",
    "机制",
    "体制",
    "体系",
    "结构",
    "功能",
    "作用",
    "影响",
    "意义",
    "价值",
    "关系",
    "联系",
    "互动",
    "协调",
    "配合",
    "组织",
    "团队",
    "集体",
    "个人",
    "群众",
    "领导",
    "干部",
    "员工",
    "人才",
    "专家",
    "企业",
    "公司",
    "单位",
    "部门",
    "岗位",
    "项目",
    "任务",
    "活动",
    "事件",
    "情况",
    "过程",
    "阶段",
    "步骤",
    "环节",
    "细节",
  ];

  const synonyms = {
    学习: ["读书", "进修", "研习"],
    工作: ["劳动", "作业", "任务"],
    生活: ["生存", "过日子", "起居"],
    时间: ["光阴", "时光", "岁月"],
    思想: ["思维", "想法", "念头"],
    精神: ["意志", "心神", "气概"],
    文化: ["文明", "教养", "学识"],
    知识: ["学问", "学识", "见识"],
    智慧: ["才智", "聪慧", "智谋"],
    能力: ["本领", "才能", "才干"],
  };

  const insertWord = db.prepare(
    "INSERT INTO words (id, word, category) VALUES (?, ?, ?)",
  );
  const insertSynonym = db.prepare(
    "INSERT INTO synonyms (id, word_id, synonym) VALUES (?, ?, ?)",
  );

  const transaction = db.transaction(() => {
    defaultWords.forEach((word) => {
      const id = randomUUID();
      insertWord.run(id, word, "general");

      if (synonyms[word]) {
        synonyms[word].forEach((syn) => {
          insertSynonym.run(randomUUID(), id, syn);
        });
      }
    });
  });

  transaction();
  console.log(`Initialized ${defaultWords.length} default words`);
}

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "服务器内部错误" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  db.close();
  process.exit(0);
});
