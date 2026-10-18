<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="note-dialog">
      <div class="dialog-header">
        <h3>编辑备注</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="dialog-body">
        <div class="card-preview" :class="{ collected: card.isCollected }">
          <span class="preview-symbol">{{ card.displayName }}</span>
          <span class="preview-status">
            {{ card.isCollected ? '✓ 已收集' : '未收集' }}
          </span>
        </div>
        <label class="field-label">备注信息（品相、来源等）</label>
        <textarea
          ref="textareaRef"
          v-model="note"
          class="note-textarea"
          placeholder="例如：品相完美，2026年7月购于某宝..."
          rows="4"
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ note.length }}/500</div>
        <p v-if="error" class="save-error" role="alert">{{ error }}</p>
      </div>
      <div class="dialog-footer">
        <button class="btn" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" :disabled="saving" @click="onSave">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { Card } from '@shared/types'

const props = defineProps<{ card: Card; saving: boolean; error: string | null }>()
const emit = defineEmits<{
  (e: 'save', cardId: string, note: string): void
  (e: 'close'): void
}>()

const note = ref(props.card.note ?? '')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

onMounted(async () => {
  await nextTick()
  textareaRef.value?.focus()
})

function onSave(): void {
  emit('save', props.card.id, note.value)
}
</script>

<style scoped>
.save-error {
  margin-top: 8px;
  color: var(--color-danger);
  font-size: 12px;
}
.note-dialog {
  background: #fff;
  border-radius: var(--radius);
  width: 440px;
  max-width: 90vw;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.2s ease;
}
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}
.dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
}
.close-btn {
  font-size: 16px;
  color: var(--color-text-secondary);
  padding: 4px;
}
.close-btn:hover {
  color: var(--color-danger);
}
.dialog-body {
  padding: 20px;
}
.card-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
}
.card-preview.collected {
  background: var(--color-card-collected);
}
.preview-symbol {
  font-size: 22px;
  font-weight: bold;
}
.preview-status {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.field-label {
  display: block;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}
.note-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  resize: vertical;
  outline: none;
  font-family: inherit;
}
.note-textarea:focus {
  border-color: var(--color-accent);
}
.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--color-border);
}
</style>
