<template>
  <div class="admin-page">
    <header class="header-welcome">
      <h1 class="clickable-title" @click="goHome">
        知觉反应与速度训练测试系统 - 管理后台
      </h1>
      <div class="header-actions">
        <button class="btn-header" @click="exitAdminMode">返回前台</button>
      </div>
    </header>

    <main class="main-welcome">
      <AdminPanel @logout="exitAdminMode" />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import AdminPanel from "../components/AdminPanel.vue";

const router = useRouter();
const authStore = useAuthStore();

function goHome() {
  exitAdminMode();
}

function exitAdminMode() {
  authStore.setAdmin(false);
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  router.push("/");
}
</script>

<style scoped>
.admin-page {
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

.main-welcome {
  padding: 24px;
  min-height: calc(100vh - 60px);
}
</style>
