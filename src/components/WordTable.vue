<template>
  <div class="word-table-container">
    <h3 class="table-title">词语表格</h3>
    <div class="word-table">
      <div class="table-row" v-for="row in 3" :key="row">
        <div class="table-cell" v-for="col in 5" :key="col">
          {{ words[(row - 1) * 5 + (col - 1)] }}
        </div>
      </div>
    </div>
    <p class="table-hint">请记住表格中的15个词语</p>
  </div>
</template>

<script setup>
defineProps({
  words: {
    type: Array,
    required: true,
    default: () => [],
  },
});
</script>

<style scoped>
.word-table-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 80px;
}

.table-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

.word-table {
  border-collapse: collapse;
  width: 100%;
}

.table-row {
  display: flex;
}

.table-cell {
  flex: 1;
  padding: 20px 16px;
  text-align: center;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
  border: 1px solid #ebeef5;
  background: #fafafa;
  transition: all 0.2s ease;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-cell:hover {
  background: #ecf5ff;
  color: #409eff;
}

.table-row:first-child .table-cell:first-child {
  border-top-left-radius: 4px;
}

.table-row:first-child .table-cell:last-child {
  border-top-right-radius: 4px;
}

.table-row:last-child .table-cell:first-child {
  border-bottom-left-radius: 4px;
}

.table-row:last-child .table-cell:last-child {
  border-bottom-right-radius: 4px;
}

.table-hint {
  margin: 16px 0 0 0;
  font-size: 13px;
  color: #909399;
  text-align: center;
}
</style>
