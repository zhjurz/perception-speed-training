-- Supabase 数据库初始化脚本
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 令牌表（用于会话管理）
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'user' 或 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 词语表
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(50) NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 同义词表
CREATE TABLE IF NOT EXISTS synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  synonym VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 形似字表
CREATE TABLE IF NOT EXISTS similar_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  similar_word VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 训练记录表
CREATE TABLE IF NOT EXISTS training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  difficulty VARCHAR(20) NOT NULL,
  table_words JSONB NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  correct_count INTEGER NOT NULL,
  total_time INTEGER NOT NULL,
  avg_time DECIMAL(5,2) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_synonyms_word_id ON synonyms(word_id);
CREATE INDEX IF NOT EXISTS idx_training_records_user_id ON training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_training_records_created_at ON training_records(created_at DESC);

-- 启用 Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE synonyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE similar_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（使用 Service Role Key 访问）
CREATE POLICY "Allow all for service role" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON admins FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON tokens FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON words FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON synonyms FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON similar_words FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON training_records FOR ALL USING (true);

-- 插入默认词语数据
INSERT INTO words (word, category) VALUES
('苹果', 'fruit'),
('香蕉', 'fruit'),
('橙子', 'fruit'),
('葡萄', 'fruit'),
('西瓜', 'fruit'),
('草莓', 'fruit'),
('樱桃', 'fruit'),
('柠檬', 'fruit'),
('芒果', 'fruit'),
('桃子', 'fruit'),
('梨子', 'fruit'),
('荔枝', 'fruit'),
('龙眼', 'fruit'),
('菠萝', 'fruit'),
('猕猴桃', 'fruit'),
('汽车', 'vehicle'),
('火车', 'vehicle'),
('飞机', 'vehicle'),
('轮船', 'vehicle'),
('自行车', 'vehicle'),
('摩托车', 'vehicle'),
('公交车', 'vehicle'),
('地铁', 'vehicle'),
('出租车', 'vehicle'),
('卡车', 'vehicle'),
('书本', 'object'),
('铅笔', 'object'),
('橡皮', 'object'),
('尺子', 'object'),
('剪刀', 'object'),
('桌子', 'object'),
('椅子', 'object'),
('电脑', 'object'),
('手机', 'object'),
('钥匙', 'object'),
('医生', 'profession'),
('教师', 'profession'),
('工程师', 'profession'),
('律师', 'profession'),
('警察', 'profession'),
('厨师', 'profession'),
('司机', 'profession'),
('护士', 'profession'),
('会计', 'profession'),
('设计师', 'profession'),
('北京', 'city'),
('上海', 'city'),
('广州', 'city'),
('深圳', 'city'),
('杭州', 'city'),
('南京', 'city'),
('成都', 'city'),
('武汉', 'city'),
('西安', 'city'),
('重庆', 'city'),
('红色', 'color'),
('蓝色', 'color'),
('绿色', 'color'),
('黄色', 'color'),
('紫色', 'color'),
('橙色', 'color'),
('粉色', 'color'),
('黑色', 'color'),
('白色', 'color'),
('灰色', 'color'),
('春天', 'season'),
('夏天', 'season'),
('秋天', 'season'),
('冬天', 'season'),
('早晨', 'time'),
('中午', 'time'),
('傍晚', 'time'),
('夜晚', 'time'),
('快乐', 'emotion'),
('悲伤', 'emotion'),
('愤怒', 'emotion'),
('惊讶', 'emotion'),
('恐惧', 'emotion'),
('喜悦', 'emotion'),
('跑步', 'action'),
('游泳', 'action'),
('跳跃', 'action'),
('行走', 'action'),
('阅读', 'action'),
('写作', 'action'),
('绘画', 'action'),
('唱歌', 'action'),
('跳舞', 'action'),
('思考', 'action'),
('太阳', 'nature'),
('月亮', 'nature'),
('星星', 'nature'),
('云朵', 'nature'),
('雨水', 'nature'),
('雪花', 'nature'),
('风声', 'nature'),
('雷电', 'nature'),
('高山', 'nature'),
('大海', 'nature'),
('河流', 'nature'),
('湖泊', 'nature'),
('森林', 'nature'),
('草原', 'nature'),
('沙漠', 'nature')
ON CONFLICT DO NOTHING;

-- 插入同义词数据
INSERT INTO synonyms (word_id, synonym)
SELECT w.id, s.synonym FROM words w
CROSS JOIN (VALUES
  ('苹果', '苹'),
  ('香蕉', '蕉'),
  ('汽车', '车'),
  ('书本', '书'),
  ('医生', '大夫'),
  ('教师', '老师'),
  ('快乐', '开心'),
  ('悲伤', '难过'),
  ('跑步', '跑'),
  ('游泳', '游水')
) AS s(word, synonym)
WHERE w.word = s.word
ON CONFLICT DO NOTHING;
