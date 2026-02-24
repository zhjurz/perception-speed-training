<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h4>批量导入词语</h4>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <p class="hint">每行一个词语，词语必须为两个字</p>
        <textarea
          v-model="inputText"
          placeholder="学习&#10;工作&#10;生活&#10;..."
          rows="10"
        ></textarea>
        <p class="preview" v-if="previewWords.length > 0">
          已识别 {{ previewWords.length }} 个有效词语
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">取消</button>
        <button
          class="btn-primary"
          @click="importWords"
          :disabled="previewWords.length === 0"
        >
          导入
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["close", "import"]);

const inputText = ref("");

const previewWords = computed(() => {
  const lines = inputText.value.split("\n");
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length === 2)
    .map((word) => ({ word, category: "general" }));
});

function importWords() {
  if (previewWords.value.length > 0) {
    emit("import", previewWords.value);
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h4 {
  margin: 0;
  font-size: 16px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.hint {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px 0;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.preview {
  font-size: 13px;
  color: #67c23a;
  margin: 12px 0 0 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
}

.btn-primary {
  padding: 10px 20px;
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
  padding: 10px 20px;
  font-size: 14px;
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}
</style>
