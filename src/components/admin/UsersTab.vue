<template>
  <div class="users-tab">
    <h3>用户数据</h3>

    <div class="users-list">
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
          <tr v-for="user in users" :key="user.id">
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
                查看详情
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="empty-state">暂无用户数据</div>
    </div>

    <div
      v-if="selectedUser"
      class="user-details-modal"
      @click.self="selectedUser = null"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h4>用户详情：{{ selectedUser.username }}</h4>
          <button class="btn-close" @click="selectedUser = null">
            &times;
          </button>
        </div>

        <div class="user-stats">
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

        <div class="recent-records">
          <h5>最近训练记录</h5>
          <div class="records-list">
            <div
              v-for="record in userRecords"
              :key="record.id"
              class="record-item"
            >
              <div class="record-info">
                <span class="difficulty">{{ record.difficulty }}</span>
                <span class="accuracy">{{ record.accuracy }}%</span>
                <span class="time">{{ formatTime(record.total_time) }}</span>
              </div>
              <span class="date">{{ formatDate(record.created_at) }}</span>
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

const users = ref([]);
const selectedUser = ref(null);
const userStats = ref({});
const userRecords = ref([]);

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

async function viewUserDetails(user) {
  selectedUser.value = user;

  try {
    const [statsRes, recordsRes] = await Promise.all([
      fetch(`${API_BASE}/training/stats/${user.id}`).then((r) => r.json()),
      fetch(`${API_BASE}/training/records/${user.id}?limit=10`).then((r) =>
        r.json(),
      ),
    ]);

    userStats.value = statsRes;
    userRecords.value = recordsRes.records || [];
  } catch (e) {
    console.error("Failed to load user details:", e);
  }
}

function getAccuracyClass(accuracy) {
  if (!accuracy) return "low";
  if (accuracy >= 80) return "high";
  if (accuracy >= 60) return "medium";
  return "low";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(seconds) {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
</script>

<style scoped>
.users-tab h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #303133;
}

.users-list table {
  width: 100%;
  border-collapse: collapse;
}

.users-list th,
.users-list td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.users-list th {
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
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.accuracy.high {
  background: #f0f9eb;
  color: #67c23a;
}

.accuracy.medium {
  background: #fdf6ec;
  color: #e6a23c;
}

.accuracy.low {
  background: #fef0f0;
  color: #f56c6c;
}

.btn-link {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
}

.btn-link:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.user-details-modal {
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h4 {
  margin: 0;
  font-size: 16px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
}

.user-stats {
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

.recent-records {
  padding: 0 20px 20px;
}

.recent-records h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
}

.records-list {
  max-height: 200px;
  overflow-y: auto;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.record-info {
  display: flex;
  gap: 12px;
}

.difficulty {
  padding: 2px 8px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
}

.accuracy {
  font-weight: 500;
}

.time {
  color: #909399;
}

.date {
  font-size: 12px;
  color: #909399;
}
</style>
