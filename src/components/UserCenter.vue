<template>
  <div class="user-center">
    <div class="center-header">
      <h2>个人中心</h2>
      <button class="btn-back" @click="$emit('back')">返回训练</button>
    </div>

    <div class="user-info">
      <div class="avatar">
        {{ userInfo?.username?.charAt(0)?.toUpperCase() }}
      </div>
      <div class="info">
        <div class="username">{{ userInfo?.username }}</div>
        <div class="join-date">
          注册时间：{{ formatDate(userInfo?.created_at) }}
        </div>
      </div>
    </div>

    <div class="stats-section">
      <h3>训练统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ stats.overall?.total_sessions || 0 }}</div>
          <div class="stat-label">总训练次数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">
            {{ stats.overall?.avg_accuracy?.toFixed(1) || 0 }}%
          </div>
          <div class="stat-label">平均正确率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.overall?.best_accuracy || 0 }}%</div>
          <div class="stat-label">最佳正确率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">
            {{ formatTime(stats.overall?.avg_total_time) }}
          </div>
          <div class="stat-label">平均用时</div>
        </div>
      </div>

      <div class="recent-stats">
        <h4>近7天训练</h4>
        <div class="recent-info">
          <span>训练次数: {{ stats.recentWeek?.sessions || 0 }}</span>
          <span
            >平均正确率:
            {{ stats.recentWeek?.avg_accuracy?.toFixed(1) || 0 }}%</span
          >
        </div>
      </div>
    </div>

    <div class="history-section">
      <h3>历史记录</h3>
      <div class="history-list">
        <div
          v-for="record in records"
          :key="record.id"
          class="history-item"
          @click="viewDetail(record)"
        >
          <div class="item-info">
            <span class="difficulty" :class="record.difficulty">
              {{ getDifficultyLabel(record.difficulty) }}
            </span>
            <span class="accuracy" :class="getAccuracyClass(record.accuracy)">
              {{ record.accuracy }}%
            </span>
            <span class="time">{{ formatTime(record.total_time) }}</span>
          </div>
          <div class="item-date">{{ formatDate(record.created_at) }}</div>
        </div>

        <div v-if="records.length === 0" class="empty-state">暂无训练记录</div>
      </div>

      <div v-if="total > records.length" class="load-more">
        <button @click="loadMore">加载更多</button>
      </div>
    </div>

    <div
      v-if="selectedRecord"
      class="detail-modal"
      @click.self="selectedRecord = null"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h4>训练详情</h4>
          <button class="btn-close" @click="selectedRecord = null">
            &times;
          </button>
        </div>

        <div class="detail-info">
          <div class="info-row">
            <span class="label">难度：</span>
            <span>{{ getDifficultyLabel(selectedRecord.difficulty) }}</span>
          </div>
          <div class="info-row">
            <span class="label">正确率：</span>
            <span>{{ selectedRecord.accuracy }}%</span>
          </div>
          <div class="info-row">
            <span class="label">总用时：</span>
            <span>{{ formatTime(selectedRecord.total_time) }}</span>
          </div>
        </div>

        <div class="table-words">
          <h5>表格词语</h5>
          <div class="word-table">
            <div class="table-row" v-for="row in 3" :key="row">
              <div class="table-cell" v-for="col in 5" :key="col">
                {{ selectedRecord.table_words[(row - 1) * 5 + (col - 1)] }}
              </div>
            </div>
          </div>
        </div>

        <div class="question-details">
          <h5>答题详情</h5>
          <div
            v-for="detail in recordDetails"
            :key="detail.id"
            class="detail-item"
          >
            <div class="detail-header">
              <span>第 {{ detail.question_index + 1 }} 题</span>
              <span :class="detail.is_correct ? 'correct' : 'wrong'">
                {{ detail.is_correct ? "✓ 正确" : "✗ 错误" }}
              </span>
              <span class="time">用时: {{ detail.time_spent }}秒</span>
            </div>
            <div class="detail-words">
              <span class="label">题目词语：</span>
              <span
                v-for="(word, i) in detail.question_words"
                :key="i"
                class="word"
                :class="{
                  'in-table': selectedRecord.table_words.includes(word),
                }"
              >
                {{ word }}
              </span>
            </div>
            <div class="detail-answer">
              您的选择: {{ detail.user_answer }}个 | 正确答案:
              {{ detail.correct_answer }}个
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  userInfo: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["back"]);

const API_BASE = "http://localhost:3001/api";

const stats = ref({});
const records = ref([]);
const total = ref(0);
const offset = ref(0);
const selectedRecord = ref(null);
const recordDetails = ref([]);

onMounted(() => {
  loadStats();
  loadRecords();
});

async function loadStats() {
  try {
    const token = localStorage.getItem("userToken");
    const res = await fetch(`${API_BASE}/training/stats/${props.userInfo.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    stats.value = await res.json();
  } catch (e) {
    console.error("Failed to load stats:", e);
  }
}

async function loadRecords() {
  try {
    const token = localStorage.getItem("userToken");
    const res = await fetch(
      `${API_BASE}/training/records/${props.userInfo.id}?limit=10&offset=${offset.value}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    records.value = [...records.value, ...(data.records || [])];
    total.value = data.total || 0;
  } catch (e) {
    console.error("Failed to load records:", e);
  }
}

async function loadMore() {
  offset.value += 10;
  await loadRecords();
}

async function viewDetail(record) {
  selectedRecord.value = record;

  try {
    const token = localStorage.getItem("userToken");
    const res = await fetch(`${API_BASE}/training/record/${record.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    recordDetails.value = data.details || [];
  } catch (e) {
    console.error("Failed to load record details:", e);
  }
}

function getDifficultyLabel(difficulty) {
  const labels = { easy: "简单", medium: "中等", hard: "困难" };
  return labels[difficulty] || difficulty;
}

function getAccuracyClass(accuracy) {
  if (accuracy >= 80) return "high";
  if (accuracy >= 60) return "medium";
  return "low";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("zh-CN");
}

function formatTime(seconds) {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
</script>

<style scoped>
.user-center {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.center-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.btn-back {
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.join-date {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.stats-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.stats-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.recent-stats h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

.recent-info {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #909399;
}

.history-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.history-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: #ecf5ff;
}

.item-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.difficulty {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.difficulty.easy {
  background: #f0f9eb;
  color: #67c23a;
}

.difficulty.medium {
  background: #fdf6ec;
  color: #e6a23c;
}

.difficulty.hard {
  background: #fef0f0;
  color: #f56c6c;
}

.accuracy {
  font-weight: 600;
}

.accuracy.high {
  color: #67c23a;
}

.accuracy.medium {
  color: #e6a23c;
}

.accuracy.low {
  color: #f56c6c;
}

.time {
  color: #909399;
}

.item-date {
  font-size: 13px;
  color: #909399;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.load-more {
  text-align: center;
  margin-top: 16px;
}

.load-more button {
  padding: 8px 24px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
}

.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h4 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
}

.detail-info {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.info-row {
  display: flex;
  gap: 8px;
}

.info-row .label {
  color: #909399;
}

.table-words,
.question-details {
  padding: 0 20px 20px;
}

.table-words h5,
.question-details h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
}

.word-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.table-row {
  display: flex;
}

.table-cell {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border: 1px solid #ebeef5;
  background: #fafafa;
}

.detail-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.detail-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-header .correct {
  color: #67c23a;
}

.detail-header .wrong {
  color: #f56c6c;
}

.detail-header .time {
  color: #909399;
}

.detail-words {
  margin-bottom: 8px;
}

.detail-words .label {
  color: #909399;
  font-size: 13px;
}

.detail-words .word {
  display: inline-block;
  padding: 2px 8px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-left: 4px;
  font-size: 13px;
}

.detail-words .word.in-table {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.detail-answer {
  font-size: 13px;
  color: #606266;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-info {
    grid-template-columns: 1fr;
  }
}
</style>
