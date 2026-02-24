<template>
  <div class="timer">
    <span class="timer-label">{{ label }}</span>
    <span class="timer-value">{{ formattedTime }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  seconds: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    default: "计时",
  },
});

const formattedTime = computed(() => {
  const minutes = Math.floor(props.seconds / 60);
  const secs = props.seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
});
</script>

<style scoped>
.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4f4f5;
  padding: 8px 16px;
  border-radius: 6px;
}

.timer-label {
  font-size: 14px;
  color: #909399;
}

.timer-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  font-family: "Consolas", "Monaco", monospace;
}
</style>
