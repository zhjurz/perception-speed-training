<template>
  <div class="home-page">
    <header class="header-welcome">
      <h1 class="clickable-title" @click="$router.push('/')">
        知觉反应与速度训练测试系统
      </h1>
      <div class="header-actions">
        <template v-if="authStore.isLoggedIn">
          <span class="user-name">{{ authStore.user?.username }}</span>
          <button class="btn-header" @click="$router.push('/user')">
            个人中心
          </button>
          <button class="btn-header" @click="showAdminLogin = true">
            管理后台
          </button>
          <button class="btn-header danger" @click="handleLogout">
            退出登录
          </button>
        </template>
        <template v-else>
          <button class="btn-header" @click="showUserLogin = true">
            登录/注册
          </button>
          <button class="btn-header" @click="showAdminLogin = true">
            管理后台
          </button>
        </template>
      </div>
    </header>

    <main class="main-welcome">
      <div class="intro-card">
        <h2>欢迎参加知觉反应与速度训练测试</h2>
        <div class="intro-content">
          <h3>测试说明</h3>
          <ul>
            <li>本测试包含10道题目，旨在训练您的知觉反应速度</li>
            <li>测试开始时，左侧将显示一个5×3的词语表格（共15个词语）</li>
            <li>每道题目给出5个词语，请判断其中有多少个来自表格</li>
            <li>选择正确答案（0-4），可自由切换题目</li>
            <li>完成所有题目后点击"交卷"提交答案</li>
          </ul>

          <div v-if="!authStore.isLoggedIn" class="login-hint">
            <p>请先登录或注册账号以开始训练</p>
            <button class="btn-primary btn-start" @click="showUserLogin = true">
              登录 / 注册
            </button>
          </div>

          <template v-else>
            <div class="difficulty-select">
              <label>选择难度级别：</label>
              <select v-model="trainingStore.difficulty">
                <option value="easy">简单（随机干扰项）</option>
                <option value="medium">中等（近义词干扰）</option>
                <option value="hard">困难（形似字干扰）</option>
              </select>
            </div>
          </template>
        </div>

        <button
          v-if="authStore.isLoggedIn"
          class="btn-primary btn-start"
          @click="startTraining"
        >
          开始测试
        </button>
      </div>
    </main>

    <UserLogin
      v-if="showUserLogin"
      @close="showUserLogin = false"
      @login="handleUserLogin"
    />

    <AdminLogin
      v-if="showAdminLogin"
      @close="showAdminLogin = false"
      @login="handleAdminLogin"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useTrainingStore } from "../stores/training";
import UserLogin from "../components/UserLogin.vue";
import AdminLogin from "../components/AdminLogin.vue";

const router = useRouter();
const authStore = useAuthStore();
const trainingStore = useTrainingStore();

const showUserLogin = ref(false);
const showAdminLogin = ref(false);

onMounted(() => {
  authStore.loadFromStorage();
});

function handleUserLogin(data) {
  authStore.setUser(data.user, data.token);
  showUserLogin.value = false;
}

function handleAdminLogin() {
  authStore.setAdmin(true);
  showAdminLogin.value = false;
  router.push("/admin");
}

function handleLogout() {
  authStore.logout();
}

function startTraining() {
  trainingStore.startTraining();
  router.push("/training");
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f0f0f0;
}

.header-welcome {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-welcome h1 {
  margin: 0;
  font-size: 20px;
}

.clickable-title {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable-title:hover {
  opacity: 0.8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 14px;
}

.btn-header {
  padding: 8px 16px;
  font-size: 14px;
  color: white;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-header:hover {
  background: rgba(255, 255, 255, 0.25);
}

.btn-header.danger {
  background: rgba(245, 108, 108, 0.3);
  border-color: rgba(245, 108, 108, 0.5);
}

.main-welcome {
  padding: 24px;
  min-height: calc(100vh - 60px);
}

.intro-card {
  background: white;
  border-radius: 8px;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.intro-card h2 {
  margin: 0 0 24px 0;
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #2563c7;
}

.intro-content h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.intro-content ul {
  list-style: none;
  padding: 0;
}

.intro-content li {
  padding-left: 20px;
  margin-bottom: 10px;
  position: relative;
  line-height: 1.8;
}

.intro-content li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #2563c7;
}

.login-hint {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  text-align: center;
}

.login-hint p {
  margin-bottom: 16px;
  color: #e6a23c;
}

.difficulty-select {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.difficulty-select label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.difficulty-select select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-primary {
  background: #2563c7;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #1a4fd9;
}

.btn-start {
  width: 100%;
  margin-top: 24px;
  padding: 14px;
  font-size: 18px;
}
</style>
