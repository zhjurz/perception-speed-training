<template>
  <div class="settings-tab">
    <h3>系统设置</h3>

    <div class="settings-section">
      <h4>修改密码</h4>
      <div class="form-group">
        <label>当前密码</label>
        <input
          type="password"
          v-model="passwordForm.oldPassword"
          placeholder="请输入当前密码"
        />
      </div>
      <div class="form-group">
        <label>新密码</label>
        <input
          type="password"
          v-model="passwordForm.newPassword"
          placeholder="请输入新密码（至少6位）"
        />
      </div>
      <div class="form-group">
        <label>确认新密码</label>
        <input
          type="password"
          v-model="passwordForm.confirmPassword"
          placeholder="请再次输入新密码"
        />
      </div>
      <button
        class="btn-primary"
        @click="changePassword"
        :disabled="passwordLoading"
      >
        {{ passwordLoading ? "修改中..." : "修改密码" }}
      </button>
      <p v-if="passwordError" class="error">{{ passwordError }}</p>
      <p v-if="passwordSuccess" class="success">{{ passwordSuccess }}</p>
    </div>

    <div class="settings-section">
      <h4>数据管理</h4>
      <div class="data-actions">
        <button class="btn-secondary" @click="exportData">导出数据</button>
        <button class="btn-danger" @click="clearData">清空训练数据</button>
      </div>
      <p class="hint">导出数据将包含所有用户训练记录和词库信息</p>
    </div>

    <div class="settings-section">
      <h4>系统信息</h4>
      <div class="info-list">
        <div class="info-item">
          <span class="label">系统版本</span>
          <span class="value">1.0.0</span>
        </div>
        <div class="info-item">
          <span class="label">数据库类型</span>
          <span class="value">SQLite</span>
        </div>
        <div class="info-item">
          <span class="label">前端框架</span>
          <span class="value">Vue 3</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["logout"]);

const API_BASE = "http://localhost:3001/api";

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordLoading = ref(false);
const passwordError = ref("");
const passwordSuccess = ref("");

async function changePassword() {
  passwordError.value = "";
  passwordSuccess.value = "";

  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    passwordError.value = "请填写所有密码字段";
    return;
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = "新密码长度至少6位";
    return;
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = "两次输入的新密码不一致";
    return;
  }

  passwordLoading.value = true;

  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword,
      }),
    });

    const data = await res.json();

    if (data.success) {
      passwordSuccess.value = "密码修改成功";
      passwordForm.value = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    } else {
      passwordError.value = data.error || "修改失败";
    }
  } catch (e) {
    passwordError.value = "网络错误";
  } finally {
    passwordLoading.value = false;
  }
}

async function exportData() {
  try {
    const [usersRes, recordsRes, wordsRes] = await Promise.all([
      fetch(`${API_BASE}/training/admin/users`).then((r) => r.json()),
      fetch(`${API_BASE}/training/admin/all-records?limit=10000`).then((r) =>
        r.json(),
      ),
      fetch(`${API_BASE}/words`).then((r) => r.json()),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      users: usersRes,
      records: recordsRes.records,
      words: wordsRes,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `training-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("导出失败");
  }
}

async function clearData() {
  if (!confirm("确定要清空所有训练数据吗？此操作不可恢复！")) return;
  if (!confirm("再次确认：这将删除所有用户的训练记录！")) return;

  alert("数据清空功能需要后端实现");
}
</script>

<style scoped>
.settings-tab h3 {
  margin: 0 0 24px 0;
  font-size: 18px;
  color: #303133;
}

.settings-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  color: #303133;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.form-group input {
  width: 300px;
  padding: 10px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.btn-primary {
  padding: 10px 24px;
  font-size: 14px;
  color: #fff;
  background: #409eff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 24px;
  font-size: 14px;
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 12px;
}

.btn-danger {
  padding: 10px 24px;
  font-size: 14px;
  color: #f56c6c;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  cursor: pointer;
}

.error {
  color: #f56c6c;
  font-size: 14px;
  margin-top: 12px;
}

.success {
  color: #67c23a;
  font-size: 14px;
  margin-top: 12px;
}

.hint {
  font-size: 13px;
  color: #909399;
  margin-top: 12px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 16px;
}

.info-item .label {
  width: 100px;
  color: #909399;
}

.info-item .value {
  color: #303133;
}
</style>
