<template>
  <div class="progress-bar-container">
    <div class="progress-info">
      <span class="progress-text">进度: {{ current }}/{{ total }}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: percentage + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  current: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const percentage = computed(() => {
  return Math.round((props.current / props.total) * 100);
});
</script>

<style scoped>
.progress-bar-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  font-size: 14px;
  color: #606266;
}

.progress-bar {
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
