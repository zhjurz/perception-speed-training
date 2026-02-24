<template>
  <div class="overview-tab">
    <h3>数据概览</h3>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users"></div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">注册用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon records"></div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalRecords }}</div>
          <div class="stat-label">训练次数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accuracy"></div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.avgAccuracy }}%</div>
          <div class="stat-label">平均正确率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon today"></div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.todayRecords }}</div>
          <div class="stat-label">今日训练</div>
        </div>
      </div>
    </div>

    <div class="word-stats">
      <h4>词库统计</h4>
      <div class="word-stats-grid">
        <div class="word-stat">
          <span class="word-stat-value">{{ wordStats.totalWords }}</span>
          <span class="word-stat-label">总词数</span>
        </div>
        <div class="word-stat">
          <span class="word-stat-value">{{ wordStats.activeWords }}</span>
          <span class="word-stat-label">启用词数</span>
        </div>
        <div class="word-stat">
          <span class="word-stat-value">{{ wordStats.totalSynonyms }}</span>
          <span class="word-stat-label">近义词</span>
        </div>
        <div class="word-stat">
          <span class="word-stat-value">{{ wordStats.totalSimilar }}</span>
          <span class="word-stat-label">形似词</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const API_BASE = "http://localhost:3001/api";

const stats = ref({
  totalUsers: 0,
  totalRecords: 0,
  avgAccuracy: 0,
  todayRecords: 0,
});

const wordStats = ref({
  totalWords: 0,
  activeWords: 0,
  totalSynonyms: 0,
  totalSimilar: 0,
});

onMounted(async () => {
  try {
    const [overviewRes, wordsStatsRes] = await Promise.all([
      fetch(`${API_BASE}/training/admin/overview`).then((r) => r.json()),
      fetch(`${API_BASE}/words/stats/overview`).then((r) => r.json()),
    ]);

    stats.value = overviewRes;
    wordStats.value = wordsStatsRes;
  } catch (e) {
    console.error("Failed to load overview:", e);
  }
});
</script>

<style scoped>
.overview-tab h3 {
  margin: 0 0 24px 0;
  font-size: 18px;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, #f5f7fa, #fff);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #ebeef5;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.users {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.stat-icon.records {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.stat-icon.accuracy {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.stat-icon.today {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.word-stats h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.word-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.word-stat {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.word-stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.word-stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .stats-grid,
  .word-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
