<template>
  <div class="training-page">
    <header class="header">
      <div class="header-title clickable" @click="confirmGoHome">
        知觉速度与准确性测试
      </div>
      <div class="timer">{{ formatTime(trainingStore.totalTime) }}</div>
      <button class="btn-submit" @click="submitTraining">交卷</button>
    </header>

    <div class="main">
      <aside class="sidebar">
        <div class="sidebar-title">知觉速度和准确性</div>
        <div class="num-grid">
          <button
            v-for="n in 10"
            :key="n"
            class="num-btn"
            :class="{
              'is-active': n === trainingStore.currentQuestion,
              'is-answered': trainingStore.selectedAnswers[n - 1] !== null,
              'is-marked': trainingStore.markedQuestions.has(n),
            }"
            @click="trainingStore.navigateTo(n)"
          >
            {{ n }}
          </button>
        </div>
      </aside>

      <div class="content">
        <div class="section-header">
          <span>知觉速度和准确性</span>
          <span>已答 {{ trainingStore.answeredCount }} / 10 题</span>
        </div>

        <div class="content-body">
          <div class="table-panel">
            <table class="word-table">
              <tbody>
                <tr v-for="row in 3" :key="row">
                  <td v-for="col in 5" :key="col">
                    {{ trainingStore.tableWords[(row - 1) * 5 + (col - 1)] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="questions-panel" ref="questionsPanel">
            <div
              v-for="(question, index) in trainingStore.questions"
              :key="index"
              class="question-item"
              :class="{
                'is-active': index + 1 === trainingStore.currentQuestion,
              }"
              :ref="
                (el) => {
                  if (el) questionRefs[index] = el;
                }
              "
            >
              <button
                class="mark-btn"
                :class="{
                  'is-marked': trainingStore.markedQuestions.has(index + 1),
                }"
                @click.stop="trainingStore.toggleMark(index + 1)"
              >
                {{
                  trainingStore.markedQuestions.has(index + 1)
                    ? "★ 取消"
                    : "☆ 标记"
                }}
              </button>
              <span class="question-num">{{ index + 1 }}</span>
              <span class="question-words">{{ question.words.join(" ") }}</span>
              <div class="question-options">
                <label
                  v-for="(label, idx) in optionLabels"
                  :key="idx"
                  class="option"
                >
                  <input
                    type="radio"
                    :name="'q' + (index + 1)"
                    :value="idx"
                    :checked="trainingStore.selectedAnswers[index] === idx"
                    @change="trainingStore.selectAnswer(index, idx)"
                  />
                  {{ label }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="bottom-bar">
          <div class="status-info">🖥️ 连接正常</div>
          <div class="btn-group">
            <button
              class="btn btn-outline"
              @click="trainingStore.toggleMark(trainingStore.currentQuestion)"
            >
              {{
                trainingStore.markedQuestions.has(trainingStore.currentQuestion)
                  ? "★ 取消标记"
                  : "☆ 标记"
              }}
            </button>
            <button
              class="btn btn-primary"
              @click="trainingStore.prevQuestion"
              :disabled="trainingStore.currentQuestion <= 1"
            >
              上一题
            </button>
            <button
              class="btn btn-primary"
              @click="trainingStore.nextQuestion"
              :disabled="trainingStore.currentQuestion >= 10"
            >
              下一题
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="trainingStore.showResultModal"
      class="result-overlay"
      @click.self="trainingStore.showResultModal = false"
    >
      <div class="result-modal">
        <div class="result-header">
          <h2>测试完成</h2>
        </div>
        <div class="result-body">
          <div class="result-stats">
            <div class="result-stat">
              <div class="stat-value">
                {{ trainingStore.results?.correctCount }}
              </div>
              <div class="stat-label">正确题数</div>
            </div>
            <div class="result-stat">
              <div class="stat-value">
                {{ trainingStore.results?.accuracy }}%
              </div>
              <div class="stat-label">正确率</div>
            </div>
            <div class="result-stat">
              <div class="stat-value">
                {{ formatTime(trainingStore.totalTime) }}
              </div>
              <div class="stat-label">总用时</div>
            </div>
          </div>
          <div class="result-grade" :class="gradeClass">{{ gradeText }}</div>
        </div>
        <div class="result-footer">
          <button class="btn btn-outline" @click="viewDetail">查看详情</button>
          <button class="btn btn-primary" @click="restartTraining">
            重新训练
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useTrainingStore } from "../stores/training";

const router = useRouter();
const authStore = useAuthStore();
const trainingStore = useTrainingStore();

const optionLabels = ["A. 0", "B. 1", "C. 2", "D. 3", "E. 4"];
const questionRefs = ref([]);
const questionsPanel = ref(null);

onMounted(() => {
  if (!trainingStore.isTraining || trainingStore.questions.length === 0) {
    trainingStore.startTraining();
  }
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});

watch(
  () => trainingStore.currentQuestion,
  (newVal) => {
    scrollToQuestion(newVal);
  },
);

function scrollToQuestion(n) {
  const el = questionRefs.value[n - 1];
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function handleKeydown(e) {
  if (e.key === "F4") {
    e.preventDefault();
    trainingStore.prevQuestion();
  }
  if (e.key === "F5") {
    e.preventDefault();
    trainingStore.nextQuestion();
  }
}

function formatTime(secs) {
  if (!secs) return "00 : 00 : 00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(" : ");
}

const gradeClass = computed(() => {
  const accuracy = parseFloat(trainingStore.results?.accuracy || 0);
  if (accuracy >= 90) return "grade-excellent";
  if (accuracy >= 70) return "grade-good";
  if (accuracy >= 60) return "grade-pass";
  return "grade-fail";
});

const gradeText = computed(() => {
  const accuracy = parseFloat(trainingStore.results?.accuracy || 0);
  if (accuracy >= 90) return "优秀";
  if (accuracy >= 70) return "良好";
  if (accuracy >= 60) return "及格";
  return "需要加强";
});

function confirmGoHome() {
  if (confirm("正在答题中，确定要返回首页吗？")) {
    trainingStore.stopTimer();
    router.push("/");
  }
}

async function submitTraining() {
  const answered = trainingStore.answeredCount;
  if (!confirm(`已作答 ${answered}/10 题，确认交卷？`)) return;
  await trainingStore.submitTraining(authStore.user?.id);
}

function viewDetail() {
  trainingStore.showResultModal = false;
  router.push("/result");
}

function restartTraining() {
  trainingStore.resetTraining();
  trainingStore.startTraining();
}
</script>

<style scoped>
.header {
  height: 56px;
  background: #1a3a7c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.header-title.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}

.header-title.clickable:hover {
  opacity: 0.8;
}

.timer {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 3px;
  font-family: "Consolas", monospace;
}

.btn-submit {
  background: #f5a623;
  color: white;
  border: none;
  padding: 10px 32px;
  font-size: 18px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.main {
  display: flex;
  height: calc(100vh - 56px);
}

.sidebar {
  width: 210px;
  background: white;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-title {
  background: #2563c7;
  color: white;
  padding: 10px 12px;
  font-weight: bold;
  font-size: 14px;
}

.num-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  padding: 8px;
}

.num-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #4a90d9;
  background: white;
  color: #2563c7;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.15s;
}

.num-btn:hover {
  background: #e8f0fb;
}

.num-btn.is-active {
  background: #f5a623;
  color: white;
  border-color: #f5a623;
}

.num-btn.is-answered {
  background: #c8dff8;
}

.num-btn.is-marked {
  background: #ffe0b2;
  border-color: #f5a623;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  background: white;
  padding: 8px 16px;
  font-weight: bold;
  color: #1a3a7c;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.content-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.table-panel {
  flex: 1;
  background: #f5f8ff;
  border-right: 1px solid #ddd;
  padding: 20px 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.word-table {
  width: 100%;
  max-width: 600px;
  border-collapse: collapse;
  border: 1px solid #000;
}

.word-table td {
  border: 1px solid #000;
  padding: 8px 20px;
  text-align: center;
  background: white;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.questions-panel {
  flex: 1;
  background: #f5f8ff;
  overflow-y: auto;
}

.question-item {
  background: #e8f0fb;
  border-bottom: 3px solid #f5f8ff;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.question-item:nth-child(odd) {
  background: #dce8f8;
}

.question-item:hover {
  background: #c8dff8;
}

.question-item.is-active {
  background: #b8d4f8;
  border-left: 3px solid #2563c7;
}

.question-num {
  background: #2563c7;
  color: white;
  padding: 2px 8px;
  border-radius: 2px;
  font-weight: bold;
  display: inline-block;
  margin-right: 10px;
  font-size: 13px;
}

.question-words {
  font-weight: bold;
  font-size: 15px;
  color: #1a3a7c;
}

.question-options {
  margin-top: 8px;
  margin-left: 38px;
}

.option {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 24px;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 0;
}

.option input[type="radio"] {
  cursor: pointer;
}

.mark-btn {
  float: right;
  background: none;
  border: 1px solid #f5a623;
  color: #f5a623;
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.mark-btn.is-marked {
  background: #f5a623;
  color: white;
}

.bottom-bar {
  background: white;
  border-top: 1px solid #ddd;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  color: #666;
  font-size: 13px;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
}

.btn-outline {
  border: 1px solid #2563c7;
  color: #2563c7;
  background: white;
}

.btn-outline:hover {
  background: #e8f0fb;
}

.btn-primary {
  background: #2563c7;
  color: white;
}

.btn-primary:hover {
  background: #1a4fd9;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.result-modal {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.result-header {
  background: #1a3a7c;
  color: white;
  padding: 16px 20px;
  border-radius: 8px 8px 0 0;
}

.result-header h2 {
  margin: 0;
  font-size: 18px;
}

.result-body {
  padding: 24px;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.result-stat {
  text-align: center;
}

.result-stat .stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #2563c7;
}

.result-stat .stat-label {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.result-grade {
  text-align: center;
  padding: 16px;
  border-radius: 6px;
  font-size: 20px;
  font-weight: bold;
}

.result-grade.grade-excellent {
  background: #f0f9eb;
  color: #67c23a;
}

.result-grade.grade-good {
  background: #ecf5ff;
  color: #409eff;
}

.result-grade.grade-pass {
  background: #fdf6ec;
  color: #e6a23c;
}

.result-grade.grade-fail {
  background: #fef0f0;
  color: #f56c6c;
}

.result-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

@media (max-width: 1024px) {
  .main {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 56px);
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
    flex-shrink: 1;
  }

  .sidebar-title {
    display: none;
  }

  .num-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 8px;
    gap: 6px;
  }

  .num-btn {
    width: 32px;
    height: 32px;
  }

  .content-body {
    flex-direction: column;
  }

  .table-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
    padding: 16px;
  }

  .word-table {
    max-width: 100%;
  }

  .word-table td {
    padding: 6px 12px;
    font-size: 14px;
  }

  .questions-panel {
    max-height: 400px;
  }
}

@media (max-width: 600px) {
  .header-title {
    font-size: 14px;
  }

  .timer {
    font-size: 16px;
  }

  .btn-submit {
    padding: 8px 16px;
    font-size: 14px;
  }

  .section-header {
    font-size: 12px;
    padding: 6px 12px;
  }

  .question-words {
    font-size: 13px;
  }

  .question-options {
    margin-left: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .option {
    margin-right: 0;
  }

  .bottom-bar {
    flex-direction: column;
    gap: 8px;
  }

  .btn-group {
    width: 100%;
    justify-content: center;
  }
}
</style>
