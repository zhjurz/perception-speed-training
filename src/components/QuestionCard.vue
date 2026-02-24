<template>
  <div class="question-card" :class="{ active: isActive }">
    <div class="question-header">
      <span class="question-number">第 {{ questionIndex + 1 }} 题</span>
      <span class="time-spent" v-if="timeSpent > 0">
        用时: {{ formatTime(timeSpent) }}
      </span>
      <span
        class="answer-status"
        :class="{ answered: selectedAnswer !== null }"
      >
        {{ selectedAnswer !== null ? `已选: ${selectedAnswer}个` : "未作答" }}
      </span>
    </div>

    <div class="question-content">
      <p class="question-text">以下词语中，有多少个出现在左侧表格中？</p>

      <div class="word-list">
        <span
          class="word-item"
          v-for="(word, index) in question.words"
          :key="index"
        >
          {{ word }}
        </span>
      </div>
    </div>

    <div class="options-container">
      <p class="options-label">请选择正确答案：</p>
      <div class="options-grid">
        <button
          v-for="option in 5"
          :key="option - 1"
          class="option-btn"
          :class="{
            selected: selectedAnswer === option - 1,
          }"
          @click="handleSelect(option - 1)"
        >
          {{ option - 1 }} 个
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTimer } from "../composables/useTimer.js";

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  questionIndex: {
    type: Number,
    required: true,
  },
  selectedAnswer: {
    type: Number,
    default: null,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select"]);

const { formatTime } = useTimer();

function handleSelect(answer) {
  emit("select", answer);
}
</script>

<style scoped>
.question-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.question-card.active {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  flex-wrap: wrap;
  gap: 8px;
}

.question-number {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.time-spent {
  font-size: 14px;
  color: #909399;
  background: #f4f4f5;
  padding: 4px 12px;
  border-radius: 4px;
}

.answer-status {
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 4px;
  background: #fef0f0;
  color: #f56c6c;
}

.answer-status.answered {
  background: #f0f9eb;
  color: #67c23a;
}

.question-content {
  margin-bottom: 24px;
}

.question-text {
  font-size: 16px;
  color: #606266;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.word-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.word-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 12px 20px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  transition: all 0.2s ease;
}

.word-item:hover {
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
}

.options-container {
  margin-top: 24px;
}

.options-label {
  font-size: 15px;
  color: #606266;
  margin: 0 0 16px 0;
}

.options-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.option-btn {
  flex: 1;
  min-width: 80px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  background: #f5f7fa;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
}

.option-btn.selected {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}
</style>
