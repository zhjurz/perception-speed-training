<template>
  <div class="result-page">
    <header class="header-welcome">
      <h1 class="clickable-title" @click="goHome">
        知觉反应与速度训练测试系统
      </h1>
      <div class="header-actions">
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
      </div>
    </header>

    <main class="main-welcome">
      <ResultPanel
        v-if="trainingStore.results"
        :results="trainingStore.results"
        :totalTime="trainingStore.totalTime"
        :tableWords="trainingStore.tableWords"
        :questions="trainingStore.questions"
        :selectedAnswers="trainingStore.selectedAnswers"
        :questionTimes="trainingStore.questionTimes"
        @restart="restartTraining"
        @viewHistory="$router.push('/user')"
      />
      <div v-else class="no-result">
        <p>暂无训练结果</p>
        <button class="btn-primary" @click="$router.push('/')">返回首页</button>
      </div>
    </main>

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
import ResultPanel from "../components/ResultPanel.vue";
import AdminLogin from "../components/AdminLogin.vue";

const router = useRouter();
const authStore = useAuthStore();
const trainingStore = useTrainingStore();

const showAdminLogin = ref(false);

onMounted(() => {
  if (!trainingStore.results) {
    router.push("/");
  }
});

function goHome() {
  trainingStore.resetTraining();
  router.push("/");
}

function handleLogout() {
  authStore.logout();
  router.push("/");
}

function handleAdminLogin() {
  authStore.setAdmin(true);
  showAdminLogin.value = false;
  router.push("/admin");
}

function restartTraining() {
  trainingStore.resetTraining();
  trainingStore.startTraining();
  router.push("/training");
}
</script>

<style scoped>
.result-page {
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

.no-result {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.no-result p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
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
</style>
