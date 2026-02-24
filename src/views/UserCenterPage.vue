<template>
  <div class="user-center-page">
    <header class="header-welcome">
      <h1 class="clickable-title" @click="goHome">
        知觉反应与速度训练测试系统
      </h1>
      <div class="header-actions">
        <span class="user-name">{{ authStore.user?.username }}</span>
        <button class="btn-header" @click="$router.push('/')">返回首页</button>
        <button class="btn-header" @click="showAdminLogin = true">
          管理后台
        </button>
        <button class="btn-header danger" @click="handleLogout">
          退出登录
        </button>
      </div>
    </header>

    <main class="main-welcome">
      <UserCenter :userInfo="authStore.user" @back="$router.push('/')" />
    </main>

    <AdminLogin
      v-if="showAdminLogin"
      @close="showAdminLogin = false"
      @login="handleAdminLogin"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import UserCenter from "../components/UserCenter.vue";
import AdminLogin from "../components/AdminLogin.vue";

const router = useRouter();
const authStore = useAuthStore();

const showAdminLogin = ref(false);

function goHome() {
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
</script>

<style scoped>
.user-center-page {
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
</style>
