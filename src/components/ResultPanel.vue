<template>
  <div class="result-panel">
    <div class="result-header">
      <h2>训练完成</h2>
      <p class="result-subtitle">以下是您的训练结果</p>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-value">{{ results.correctCount }}</div>
        <div class="stat-label">正确题数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ results.accuracy }}%</div>
        <div class="stat-label">正确率</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ formatTime(totalTime) }}</div>
        <div class="stat-label">总用时</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ results.avgTime }}秒</div>
        <div class="stat-label">平均每题</div>
      </div>
    </div>

    <div class="result-grade" :class="gradeClass">
      <span class="grade-label">综合评价</span>
      <span class="grade-text">{{ gradeText }}</span>
    </div>

    <div class="table-section">
      <h3>词语表格</h3>
      <table class="word-table-result">
        <tbody>
          <tr v-for="row in 3" :key="row">
            <td v-for="col in 5" :key="col">
              {{ tableWords[(row - 1) * 5 + (col - 1)] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="detail-section">
      <h3>答题详情</h3>
      <div class="detail-list">
        <div
          class="detail-item"
          v-for="(detail, index) in results.details"
          :key="index"
          :class="{ correct: detail.isCorrect, wrong: !detail.isCorrect }"
        >
          <div class="detail-header">
            <span class="detail-number">第 {{ index + 1 }} 题</span>
            <span class="detail-status">
              {{ detail.isCorrect ? "✓ 正确" : "✗ 错误" }}
            </span>
            <span class="detail-time"
              >用时: {{ formatTime(detail.timeSpent) }}</span
            >
          </div>
          <div class="detail-content">
            <div class="detail-words">
              <span class="detail-label">题目词语：</span>
              <div class="word-tags">
                <span
                  class="word-tag"
                  :class="{ 'in-table': tableWords.includes(word) }"
                  v-for="(word, wIndex) in detail.questionWords"
                  :key="wIndex"
                >
                  {{ word }}
                  <span v-if="tableWords.includes(word)" class="tag-indicator"
                    >✓</span
                  >
                </span>
              </div>
            </div>
            <div class="detail-answers">
              <span class="answer-item">
                您的选择:
                <strong>{{
                  detail.userAnswer !== null
                    ? detail.userAnswer + " 个"
                    : "未作答"
                }}</strong>
              </span>
              <span class="answer-item correct-answer">
                正确答案: <strong>{{ detail.correctAnswer }} 个</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button class="btn-secondary" @click="$emit('viewHistory')">
        查看历史记录
      </button>
      <button class="btn-primary" @click="$emit('restart')">重新训练</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  results: {
    type: Object,
    required: true,
  },
  totalTime: {
    type: Number,
    required: true,
  },
  tableWords: {
    type: Array,
    required: true,
  },
  questions: {
    type: Array,
    required: true,
  },
  selectedAnswers: {
    type: Array,
    required: true,
  },
  questionTimes: {
    type: Array,
    required: true,
  },
});

defineEmits(["restart", "viewHistory"]);

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const gradeClass = computed(() => {
  const accuracy = parseFloat(props.results.accuracy);
  if (accuracy >= 90) return "grade-excellent";
  if (accuracy >= 70) return "grade-good";
  if (accuracy >= 60) return "grade-pass";
  return "grade-fail";
});

const gradeText = computed(() => {
  const accuracy = parseFloat(props.results.accuracy);
  if (accuracy >= 90) return "优秀";
  if (accuracy >= 70) return "良好";
  if (accuracy >= 60) return "及格";
  return "需要加强";
});
</script>

<style scoped>
.result-panel {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.result-header {
  text-align: center;
  margin-bottom: 32px;
}

.result-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #303133;
}

.result-subtitle {
  margin: 0;
  font-size: 16px;
  color: #909399;
}

.table-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.table-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.word-table-result {
  width: 100%;
  max-width: 500px;
  border-collapse: collapse;
  border: 1px solid #000;
  margin: 0 auto;
}

.word-table-result td {
  border: 1px solid #000;
  padding: 10px 20px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.result-grade {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.result-grade.grade-excellent {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  color: #fff;
}

.result-grade.grade-good {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: #fff;
}

.result-grade.grade-pass {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
  color: #fff;
}

.result-grade.grade-fail {
  background: linear-gradient(135deg, #f56c6c, #f78989);
  color: #fff;
}

.grade-label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.grade-text {
  font-size: 24px;
  font-weight: 700;
}

.detail-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #303133;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
}

.detail-item.correct {
  border-left: 4px solid #67c23a;
  background: #f0f9eb;
}

.detail-item.wrong {
  border-left: 4px solid #f56c6c;
  background: #fef0f0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.detail-number {
  font-weight: 600;
  color: #303133;
}

.detail-status {
  font-size: 14px;
  font-weight: 500;
}

.detail-item.correct .detail-status {
  color: #67c23a;
}

.detail-item.wrong .detail-status {
  color: #f56c6c;
}

.detail-time {
  font-size: 13px;
  color: #909399;
  margin-left: auto;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-words {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  color: #606266;
}

.word-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.word-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.word-tag.in-table {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.tag-indicator {
  font-size: 12px;
}

.detail-answers {
  display: flex;
  gap: 24px;
  font-size: 14px;
}

.answer-item {
  color: #606266;
}

.answer-item strong {
  color: #303133;
}

.correct-answer strong {
  color: #67c23a;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-primary {
  padding: 14px 48px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.btn-secondary {
  padding: 14px 48px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  color: #409eff;
  border-color: #409eff;
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-header {
    flex-wrap: wrap;
  }

  .detail-time {
    margin-left: 0;
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
