<template>
  <div class="admin-login-overlay" @click.self="$emit('close')">
    <div class="admin-login-modal">
      <div class="modal-header">
        <h2>管理员登录</h2>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <div v-if="setupRequired" class="setup-form">
        <p class="setup-hint">首次使用，请设置管理员账号</p>
        <div class="form-group">
          <label>用户名</label>
          <input
            type="text"
            v-model="form.username"
            placeholder="请输入用户名"
            maxlength="20"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            type="password"
            v-model="form.password"
            placeholder="请输入密码（至少6位）"
          />
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input
            type="password"
            v-model="form.confirmPassword"
            placeholder="请再次输入密码"
          />
        </div>
        <button class="btn-primary" @click="setupAdmin" :disabled="loading">
          {{ loading ? "设置中..." : "创建管理员" }}
        </button>
      </div>

      <div v-else class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input
            type="text"
            v-model="form.username"
            placeholder="请输入用户名"
            @keyup.enter="login"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            type="password"
            v-model="form.password"
            placeholder="请输入密码"
            @keyup.enter="login"
          />
        </div>
        <button class="btn-primary" @click="login" :disabled="loading">
          {{ loading ? "登录中..." : "登录" }}
        </button>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const emit = defineEmits(["close", "login"]);

const API_BASE = "http://localhost:3001/api";

const setupRequired = ref(false);
const loading = ref(false);
const error = ref("");
const form = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/admin/check-setup`);
    const data = await res.json();
    setupRequired.value = data.setupRequired;
  } catch (e) {
    error.value = "无法连接服务器";
  }
});

async function setupAdmin() {
  if (!form.value.username || !form.value.password) {
    error.value = "请填写用户名和密码";
    return;
  }

  if (form.value.password.length < 6) {
    error.value = "密码长度至少6位";
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = "两次输入的密码不一致";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const res = await fetch(`${API_BASE}/auth/admin/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.value.username,
        password: form.value.password,
      }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));
      emit("login", data);
    } else {
      error.value = data.error || "设置失败";
    }
  } catch (e) {
    error.value = "网络错误，请重试";
  } finally {
    loading.value = false;
  }
}

async function login() {
  if (!form.value.username || !form.value.password) {
    error.value = "请填写用户名和密码";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.value.username,
        password: form.value.password,
      }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));
      emit("login", data);
    } else {
      error.value = data.error || "登录失败";
    }
  } catch (e) {
    error.value = "网络错误，请重试";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.admin-login-overlay {
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

.admin-login-modal {
  background: #fff;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-close:hover {
  color: #606266;
}

.setup-form,
.login-form {
  padding: 24px;
}

.setup-hint {
  text-align: center;
  color: #e6a23c;
  margin-bottom: 20px;
  font-size: 14px;
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
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  margin: 16px 24px 24px;
}
</style>
