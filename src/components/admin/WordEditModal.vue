<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h4>{{ word ? "编辑词语" : "添加词语" }}</h4>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>词语 <span class="required">*</span></label>
          <input
            type="text"
            v-model="form.word"
            placeholder="请输入二字词语"
            maxlength="2"
          />
        </div>

        <div class="form-group">
          <label>分类</label>
          <select v-model="form.category">
            <option value="general">通用</option>
            <option value="noun">名词</option>
            <option value="verb">动词</option>
            <option value="adj">形容词</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div class="form-group">
          <label>近义词</label>
          <div class="tags-input">
            <span v-for="(syn, i) in form.synonyms" :key="i" class="tag">
              {{ syn }}
              <button @click="removeSynonym(i)">&times;</button>
            </span>
            <input
              type="text"
              v-model="newSynonym"
              placeholder="输入后按回车添加"
              @keyup.enter="addSynonym"
            />
          </div>
        </div>

        <div class="form-group">
          <label>形似词</label>
          <div class="tags-input">
            <span v-for="(sim, i) in form.similar_words" :key="i" class="tag">
              {{ sim }}
              <button @click="removeSimilar(i)">&times;</button>
            </span>
            <input
              type="text"
              v-model="newSimilar"
              placeholder="输入后按回车添加"
              @keyup.enter="addSimilar"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.is_active" />
            启用该词语
          </label>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn-primary" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  word: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "save"]);

const form = ref({
  id: null,
  word: "",
  category: "general",
  synonyms: [],
  similar_words: [],
  is_active: true,
});

const newSynonym = ref("");
const newSimilar = ref("");

onMounted(() => {
  if (props.word) {
    form.value = {
      id: props.word.id,
      word: props.word.word,
      category: props.word.category || "general",
      synonyms: [...(props.word.synonyms || [])],
      similar_words: [...(props.word.similar_words || [])],
      is_active: props.word.is_active,
    };
  }
});

function addSynonym() {
  if (newSynonym.value.trim()) {
    form.value.synonyms.push(newSynonym.value.trim());
    newSynonym.value = "";
  }
}

function removeSynonym(index) {
  form.value.synonyms.splice(index, 1);
}

function addSimilar() {
  if (newSimilar.value.trim()) {
    form.value.similar_words.push(newSimilar.value.trim());
    newSimilar.value = "";
  }
}

function removeSimilar(index) {
  form.value.similar_words.splice(index, 1);
}

function save() {
  if (!form.value.word || form.value.word.length !== 2) {
    alert("请输入有效的二字词语");
    return;
  }

  emit("save", form.value);
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.required {
  color: #f56c6c;
}

.form-group input[type="text"],
.form-group select {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  min-height: 42px;
}

.tags-input .tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 13px;
}

.tags-input .tag button {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  line-height: 1;
}

.tags-input input {
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  padding: 4px;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
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
