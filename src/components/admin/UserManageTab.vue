<template>
  <div class="user-manage-tab">
    <h3>用户管理</h3>

    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索用户名..."
        @input="filterUsers"
      />
    </div>

    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>用户名</th>
            <th>训练次数</th>
            <th>平均正确率</th>
            <th>最近训练</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="username">{{ user.username }}</td>
            <td>{{ user.total_sessions || 0 }} 次</td>
            <td>
              <span
                class="accuracy"
                :class="getAccuracyClass(user.avg_accuracy)"
              >
                {{ user.avg_accuracy ? user.avg_accuracy.toFixed(1) : 0 }}%
              </span>
            </td>
            <td>{{ formatDate(user.last_training) }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <button class="btn-link" @click="viewUserDetails(user)">
                详情
              </button>
              <button class="btn-link" @click="viewUserRecords(user)">
                记录
              </button>
              <button class="btn-link danger" @click="deleteUser(user)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredUsers.length === 0" class="empty-state">
        暂无用户数据
      </div>
    </div>

    <div v-if="selectedUser" class="user-modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h4>
            {{ modalMode === "detail" ? "用户详情" : "训练记录" }} -
            {{ selectedUser.username }}
          </h4>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <div v-if="modalMode === 'detail'" class="user-detail">
          <div class="detail-stats">
            <div class="stat-item">
              <span class="label">总训练次数</span>
              <span class="value">{{
                userStats.overall?.total_sessions || 0
              }}</span>
            </div>
            <div class="stat-item">
              <span class="label">平均正确率</span>
              <span class="value"
                >{{ userStats.overall?.avg_accuracy?.toFixed(1) || 0 }}%</span
              >
            </div>
            <div class="stat-item">
              <span class="label">最佳正确率</span>
              <span class="value"
                >{{ userStats.overall?.best_accuracy || 0 }}%</span
              >
            </div>
            <div class="stat-item">
              <span class="label">平均用时</span>
              <span class="value">{{
                formatTime(userStats.overall?.avg_total_time)
              }}</span>
            </div>
          </div>

          <div class="difficulty-stats">
            <h5>各难度表现</h5>
            <div
              class="diff-item"
              v-for="diff in userStats.byDifficulty"
              :key="diff.difficulty"
            >
              <span class="diff-label" :class="diff.difficulty">
                {{ getDifficultyLabel(diff.difficulty) }}
              </span>
              <span>训练 {{ diff.count }} 次</span>
              <span>平均正确率 {{ diff.avg_accuracy?.toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <div v-else class="user-records">
          <div
            class="record-item"
            v-for="record in userRecords"
            :key="record.id"
            @click="viewRecordDetail(record)"
          >
            <div class="record-info">
              <span class="difficulty" :class="record.difficulty">
                {{ getDifficultyLabel(record.difficulty) }}
              </span>
              <span class="accuracy">{{ record.accuracy }}%</span>
              <span class="time">{{ formatTime(record.total_time) }}</span>
            </div>
            <span class="date">{{ formatDate(record.created_at) }}</span>
          </div>

          <div v-if="userRecords.length === 0" class="empty-state">
            暂无训练记录
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="selectedRecord"
      class="record-modal"
      @click.self="selectedRecord = null"
    >
      <div class="modal-content large">
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
import { ref, onMounted, computed } from "vue";

const API_BASE = "http://localhost:3001/api";

const users = ref([]);
const searchQuery = ref("");
const selectedUser = ref(null);
const modalMode = ref("detail");
const userStats = ref({});
const userRecords = ref([]);
const selectedRecord = ref(null);
const recordDetails = ref([]);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter((u) => u.username.toLowerCase().includes(query));
});

onMounted(() => {
  loadUsers();
});

async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE}/training/admin/users`);
    users.value = await res.json();
  } catch (e) {
    console.error("Failed to load users:", e);
  }
}

function filterUsers() {}

async function viewUserDetails(user) {
  selectedUser.value = user;
  modalMode.value = "detail";

  try {
    const res = await fetch(`${API_BASE}/training/stats/${user.id}`);
    userStats.value = await res.json();
  } catch (e) {
    console.error("Failed to load user stats:", e);
  }
}

async function viewUserRecords(user) {
  selectedUser.value = user;
  modalMode.value = "records";

  try {
    const res = await fetch(`${API_BASE}/training/records/${user.id}?limit=20`);
    const data = await res.json();
    userRecords.value = data.records || [];
  } catch (e) {
    console.error("Failed to load user records:", e);
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

async function deleteUser(user) {
  if (
    !confirm(
      `确定要删除用户"${user.username}"吗？这将删除该用户的所有训练记录！`,
    )
  )
    return;

  try {
    const res = await fetch(`${API_BASE}/training/admin/user/${user.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      loadUsers();
      closeModal();
    } else {
      const data = await res.json();
      alert(data.error || "删除失败");
    }
  } catch (e) {
    console.error("Failed to delete user:", e);
    alert("删除失败");
  }
}

function closeModal() {
  selectedUser.value = null;
  userStats.value = {};
  userRecords.value = [];
}

function getDifficultyLabel(difficulty) {
  const labels = { easy: "简单", medium: "中等", hard: "困难" };
  return labels[difficulty] || difficulty;
}

function getAccuracyClass(accuracy) {
  if (!accuracy) return "low";
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
.user-manage-tab h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #303133;
}

.search-bar {
  margin-bottom: 16px;
}

.search-bar input {
  width: 300px;
  padding: 10px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.users-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
  font-size: 13px;
}

.username {
  font-weight: 500;
  color: #303133;
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
  font-size: 14px;
}

.btn-link.danger {
  color: #f56c6c;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.user-modal,
.record-modal {
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
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.large {
  width: 700px;
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

.detail-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.stat-item .label {
  display: block;
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-item .value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.difficulty-stats {
  padding: 0 20px 20px;
}

.difficulty-stats h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
}

.diff-item {
  display: flex;
  gap: 16px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 14px;
}

.diff-label {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.diff-label.easy {
  background: #f0f9eb;
  color: #67c23a;
}

.diff-label.medium {
  background: #fdf6ec;
  color: #e6a23c;
}

.diff-label.hard {
  background: #fef0f0;
  color: #f56c6c;
}

.user-records {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}

.record-item:hover {
  background: #ecf5ff;
}

.record-info {
  display: flex;
  gap: 12px;
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

.date {
  font-size: 13px;
  color: #909399;
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
</style>
