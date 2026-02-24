<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h2>管理后台</h2>
      <div class="admin-actions">
        <span class="admin-user">欢迎，{{ adminUser?.username }}</span>
        <button class="btn-logout" @click="$emit('logout')">退出</button>
      </div>
    </div>

    <div class="admin-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        数据概览
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        用户管理
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'words' }"
        @click="activeTab = 'words'"
      >
        词库管理
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'records' }"
        @click="activeTab = 'records'"
      >
        训练记录
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'settings' }"
        @click="activeTab = 'settings'"
      >
        系统设置
      </button>
    </div>

    <div class="admin-content">
      <OverviewTab v-if="activeTab === 'overview'" />
      <UserManageTab v-else-if="activeTab === 'users'" />
      <WordsTab v-else-if="activeTab === 'words'" />
      <RecordsTab v-else-if="activeTab === 'records'" />
      <SettingsTab
        v-else-if="activeTab === 'settings'"
        @logout="$emit('logout')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import OverviewTab from "./admin/OverviewTab.vue";
import UserManageTab from "./admin/UserManageTab.vue";
import WordsTab from "./admin/WordsTab.vue";
import RecordsTab from "./admin/RecordsTab.vue";
import SettingsTab from "./admin/SettingsTab.vue";

const emit = defineEmits(["logout"]);

const activeTab = ref("overview");
const adminUser = ref(null);

onMounted(() => {
  const stored = localStorage.getItem("adminUser");
  if (stored) {
    adminUser.value = JSON.parse(stored);
  }
});
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.admin-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-user {
  font-size: 14px;
  color: #606266;
}

.btn-logout {
  padding: 8px 16px;
  font-size: 14px;
  color: #f56c6c;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #f56c6c;
  color: #fff;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 20px;
  font-size: 14px;
  color: #606266;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.tab-btn.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

.admin-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: 400px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
