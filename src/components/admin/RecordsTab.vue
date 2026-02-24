<template>
  <div class="records-tab">
    <h3>训练记录</h3>

    <div class="filters">
      <input
        type="text"
        v-model="searchUser"
        placeholder="搜索用户名..."
        @input="loadRecords"
      />
      <input type="date" v-model="startDate" @change="loadRecords" />
      <input type="date" v-model="endDate" @change="loadRecords" />
    </div>

    <div class="records-table">
      <table>
        <thead>
          <tr>
            <th>用户</th>
            <th>难度</th>
            <th>正确率</th>
            <th>用时</th>
            <th>训练时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id">
            <td>{{ record.username }}</td>
            <td>
              <span class="difficulty-badge" :class="record.difficulty">
                {{ getDifficultyLabel(record.difficulty) }}
              </span>
            </td>
            <td>
              <span class="accuracy" :class="getAccuracyClass(record.accuracy)">
                {{ record.accuracy }}%
              </span>
            </td>
            <td>{{ formatTime(record.total_time) }}</td>
            <td>{{ formatDate(record.created_at) }}</td>
            <td>
              <button class="btn-link" @click="viewRecordDetail(record)">
                详情
              </button>
              <button class="btn-link danger" @click="deleteRecord(record)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="records.length === 0" class="empty-state">暂无训练记录</div>
    </div>

    <div class="pagination">
      <button class="btn-page" :disabled="offset === 0" @click="prevPage">
        上一页
      </button>
      <span>共 {{ total }} 条记录</span>
      <button
        class="btn-page"
        :disabled="offset + limit >= total"
        @click="nextPage"
      >
        下一页
      </button>
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
            <span class="label">用户：</span>
            <span>{{ selectedRecord.username }}</span>
          </div>
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
              用户答案: {{ detail.user_answer }} | 正确答案:
              {{ detail.correct_answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const API_BASE = "http://localhost:3001/api";

const records = ref([]);
const total = ref(0);
const offset = ref(0);
const limit = 20;
const searchUser = ref("");
const startDate = ref("");
const endDate = ref("");
const selectedRecord = ref(null);
const recordDetails = ref([]);

onMounted(() => {
  loadRecords();
});

async function loadRecords() {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.value.toString(),
    });

    if (searchUser.value) params.append("userId", searchUser.value);
    if (startDate.value) params.append("startDate", startDate.value);
    if (endDate.value) params.append("endDate", endDate.value);

    const res = await fetch(`${API_BASE}/training/admin/all-records?${params}`);
    const data = await res.json();

    records.value = data.records || [];
    total.value = data.total || 0;
  } catch (e) {
    console.error("Failed to load records:", e);
  }
}

async function viewRecordDetail(record) {
  selectedRecord.value = record;

  try {
    const res = await fetch(`${API_BASE}/training/record/${record.id}`);
    const data = await res.json();
    recordDetails.value = data.details || [];
  } catch (e) {
    console.error("Failed to load record details:", e);
  }
}

async function deleteRecord(record) {
  if (!confirm(`确定要删除该训练记录吗？此操作不可恢复！`)) return;

  try {
    const res = await fetch(`${API_BASE}/training/record/${record.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      loadRecords();
      if (selectedRecord.value?.id === record.id) {
        selectedRecord.value = null;
      }
    } else {
      const data = await res.json();
      alert(data.error || "删除失败");
    }
  } catch (e) {
    console.error("Failed to delete record:", e);
    alert("删除失败");
  }
}

function prevPage() {
  if (offset.value >= limit) {
    offset.value -= limit;
    loadRecords();
  }
}

function nextPage() {
  if (offset.value + limit < total.value) {
    offset.value += limit;
    loadRecords();
  }
}

function getDifficultyLabel(difficulty) {
  const labels = {
    easy: "简单",
    medium: "中等",
    hard: "困难",
  };
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
.records-tab h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #303133;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.filters input {
  padding: 10px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.filters input[type="text"] {
  flex: 1;
}

.records-table table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th,
.records-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.records-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
  font-size: 13px;
}

.difficulty-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.difficulty-badge.easy {
  background: #f0f9eb;
  color: #67c23a;
}

.difficulty-badge.medium {
  background: #fdf6ec;
  color: #e6a23c;
}

.difficulty-badge.hard {
  background: #fef0f0;
  color: #f56c6c;
}

.accuracy {
  font-weight: 500;
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

.btn-link {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  margin-right: 8px;
}

.btn-link.danger {
  color: #f56c6c;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.btn-page {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  width: 700px;
  max-width: 90%;
  max-height: 85vh;
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
  grid-template-columns: repeat(2, 1fr);
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
</style>
