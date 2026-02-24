import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, "data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, "training.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS training_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    table_words TEXT NOT NULL,
    accuracy REAL NOT NULL,
    correct_count INTEGER NOT NULL,
    total_time INTEGER NOT NULL,
    avg_time REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS training_details (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL,
    question_index INTEGER NOT NULL,
    question_words TEXT NOT NULL,
    user_answer INTEGER,
    correct_answer INTEGER NOT NULL,
    time_spent INTEGER NOT NULL,
    is_correct INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES training_records(id)
  );

  CREATE TABLE IF NOT EXISTS words (
    id TEXT PRIMARY KEY,
    word TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'general',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS synonyms (
    id TEXT PRIMARY KEY,
    word_id TEXT NOT NULL,
    synonym TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id)
  );

  CREATE TABLE IF NOT EXISTS similar_words (
    id TEXT PRIMARY KEY,
    word_id TEXT NOT NULL,
    similar_word TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id)
  );

  CREATE TABLE IF NOT EXISTS admin (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_training_records_user ON training_records(user_id);
  CREATE INDEX IF NOT EXISTS idx_training_records_created ON training_records(created_at);
  CREATE INDEX IF NOT EXISTS idx_training_details_record ON training_details(record_id);
  CREATE INDEX IF NOT EXISTS idx_words_active ON words(is_active);
`);

try {
  db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
} catch (e) {
  // Column already exists, ignore
}

export default db;
