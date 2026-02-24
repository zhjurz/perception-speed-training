<template>
  <div class="user-auth-overlay" @click.self="$emit('close')">
    <div class="user-auth-modal">
      <div class="modal-header">
        <h2>{{ isLogin ? "用户登录" : "用户注册" }}</h2>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <div class="auth-form">
        <div class="form-group">
          <label>用户名</label>
          <input
            type="text"
            v-model="form.username"
            placeholder="请输入用户名（2-20个字符）"
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
        <div v-if="!isLogin" class="form-group">
          <label>确认密码</label>
          <input
            type="password"
            v-model="form.confirmPassword"
            placeholder="请再次输入密码"
          />
        </div>

        <button class="btn-primary" @click="handleSubmit" :disabled="loading">
          {{ loading ? "处理中..." : isLogin ? "登录" : "注册" }}
        </button>

        <p class="switch-mode">
          {{ isLogin ? "还没有账号？" : "已有账号？" }}
          <button class="btn-link" @click="isLogin = !isLogin">
            {{ isLogin ? "立即注册" : "立即登录" }}
          </button>
        </p>

        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["close", "login"]);

const API_BASE = "http://localhost:3001/api";

const isLogin = ref(true);
const loading = ref(false);
const error = ref("");
const form = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

async function handleSubmit() {
  error.value = "";

  if (!form.value.username || !form.value.password) {
    error.value = "请填写用户名和密码";
    return;
  }

  if (form.value.username.length < 2 || form.value.username.length > 20) {
    error.value = "用户名长度应在2-20个字符之间";
    return;
  }

  if (form.value.password.length < 6) {
    error.value = "密码长度至少6位";
    return;
  }

  if (!isLogin.value && form.value.password !== form.value.confirmPassword) {
    error.value = "两次输入的密码不一致";
    return;
  }

  loading.value = true;

  try {
    const endpoint = isLogin.value ? "/auth/login" : "/auth/register";
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.value.username,
        password: form.value.password,
      }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      emit("login", data);
    } else {
      error.value = data.error || (isLogin.value ? "登录失败" : "注册失败");
    }
  } catch (e) {
    error.value = "网络错误，请重试";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.user-auth-overlay {
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

.user-auth-modal {
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

.auth-form {
  padding: 24px;
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
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-mode {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #909399;
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

.error-message {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  margin-top: 12px;
}
</style>
