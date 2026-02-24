<template>
  <div class="words-tab">
    <div class="tab-header">
      <h3>词库管理</h3>
      <div class="header-actions">
        <button class="btn-primary" @click="showAddModal = true">
          添加词语
        </button>
        <button class="btn-secondary" @click="showBatchModal = true">
          批量导入
        </button>
      </div>
    </div>

    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索词语..."
        @input="filterWords"
      />
      <select v-model="filterStatus" @change="filterWords">
        <option value="all">全部状态</option>
        <option value="active">已启用</option>
        <option value="inactive">已禁用</option>
      </select>
    </div>

    <div class="words-table">
      <table>
        <thead>
          <tr>
            <th>词语</th>
            <th>分类</th>
            <th>近义词</th>
            <th>形似词</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="word in filteredWords" :key="word.id">
            <td class="word-cell">{{ word.word }}</td>
            <td>{{ word.category }}</td>
            <td>
              <span
                class="tag"
                v-for="(syn, i) in word.synonyms?.slice(0, 2)"
                :key="i"
              >
                {{ syn }}
              </span>
              <span v-if="word.synonyms?.length > 2" class="more">
                +{{ word.synonyms.length - 2 }}
              </span>
            </td>
            <td>
              <span
                class="tag"
                v-for="(sim, i) in word.similar_words?.slice(0, 2)"
                :key="i"
              >
                {{ sim }}
              </span>
              <span v-if="word.similar_words?.length > 2" class="more">
                +{{ word.similar_words.length - 2 }}
              </span>
            </td>
            <td>
              <span
                class="status-badge"
                :class="word.is_active ? 'active' : 'inactive'"
              >
                {{ word.is_active ? "启用" : "禁用" }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon" @click="editWord(word)" title="编辑">
                ✏️
              </button>
              <button
                class="btn-icon"
                @click="toggleWordStatus(word)"
                :title="word.is_active ? '禁用' : '启用'"
              >
                {{ word.is_active ? "🔒" : "🔓" }}
              </button>
              <button
                class="btn-icon danger"
                @click="deleteWord(word)"
                title="删除"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredWords.length === 0" class="empty-state">暂无数据</div>
    </div>

    <div class="pagination">
      <span>共 {{ words.length }} 条记录</span>
    </div>

    <WordEditModal
      v-if="showAddModal || editingWord"
      :word="editingWord"
      @close="closeEditModal"
      @save="saveWord"
    />

    <BatchImportModal
      v-if="showBatchModal"
      @close="showBatchModal = false"
      @import="handleBatchImport"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import WordEditModal from "./WordEditModal.vue";
import BatchImportModal from "./BatchImportModal.vue";

const API_BASE = "http://localhost:3001/api";

const words = ref([]);
const searchQuery = ref("");
const filterStatus = ref("all");
const showAddModal = ref(false);
const showBatchModal = ref(false);
const editingWord = ref(null);

const filteredWords = computed(() => {
  let result = words.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (w) =>
        w.word.toLowerCase().includes(query) ||
        w.synonyms?.some((s) => s.toLowerCase().includes(query)),
    );
  }

  if (filterStatus.value !== "all") {
    const isActive = filterStatus.value === "active";
    result = result.filter((w) => w.is_active === isActive);
  }

  return result;
});

onMounted(() => {
  loadWords();
});

async function loadWords() {
  try {
    const res = await fetch(`${API_BASE}/words`);
    words.value = await res.json();
  } catch (e) {
    console.error("Failed to load words:", e);
  }
}

function filterWords() {}

function editWord(word) {
  editingWord.value = { ...word };
}

function closeEditModal() {
  showAddModal.value = false;
  editingWord.value = null;
}

async function saveWord(wordData) {
  try {
    const isEdit = !!wordData.id;
    const url = isEdit
      ? `${API_BASE}/words/${wordData.id}`
      : `${API_BASE}/words`;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wordData),
    });

    if (res.ok) {
      loadWords();
      closeEditModal();
    }
  } catch (e) {
    console.error("Failed to save word:", e);
  }
}

async function toggleWordStatus(word) {
  try {
    await fetch(`${API_BASE}/words/${word.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !word.is_active }),
    });
    loadWords();
  } catch (e) {
    console.error("Failed to toggle status:", e);
  }
}

async function deleteWord(word) {
  if (!confirm(`确定要删除词语"${word.word}"吗？`)) return;

  try {
    await fetch(`${API_BASE}/words/${word.id}`, { method: "DELETE" });
    loadWords();
  } catch (e) {
    console.error("Failed to delete word:", e);
  }
}

async function handleBatchImport(wordsList) {
  try {
    await fetch(`${API_BASE}/words/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words: wordsList }),
    });
    loadWords();
    showBatchModal.value = false;
  } catch (e) {
    console.error("Failed to batch import:", e);
  }
}
</script>

<style scoped>
.words-tab {
  min-height: 400px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tab-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
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

.btn-secondary {
  padding: 10px 20px;
  font-size: 14px;
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-bar input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.search-bar select {
  padding: 10px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}

.words-table {
  overflow-x: auto;
}

.words-table table {
  width: 100%;
  border-collapse: collapse;
}

.words-table th,
.words-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.words-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
  font-size: 13px;
}

.word-cell {
  font-weight: 500;
  font-size: 16px;
  color: #303133;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
  margin-bottom: 4px;
}

.more {
  color: #909399;
  font-size: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.active {
  background: #f0f9eb;
  color: #67c23a;
}

.status-badge.inactive {
  background: #f4f4f5;
  color: #909399;
}

.actions {
  white-space: nowrap;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 1;
}

.btn-icon.danger:hover {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.pagination {
  margin-top: 16px;
  text-align: right;
  color: #909399;
  font-size: 13px;
}
</style>
