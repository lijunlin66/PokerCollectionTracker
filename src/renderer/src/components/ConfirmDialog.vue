<template>
  <div class="modal-mask" @click.self="$emit('cancel')">
    <div class="confirm-dialog" :class="{ danger }">
      <div class="dialog-icon">{{ danger ? '⚠️' : icon }}</div>
      <h3 class="dialog-title">{{ title }}</h3>
      <p class="dialog-message">{{ message }}</p>
      <div class="dialog-footer">
        <button v-if="showCancel" class="btn" @click="$emit('cancel')">
          {{ cancelText }}
        </button>
        <button
          v-if="secondaryText"
          class="btn"
          @click="$emit('secondary')"
        >
          {{ secondaryText }}
        </button>
        <button
          class="btn"
          :class="danger ? 'btn-danger-solid' : 'btn-primary'"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  danger?: boolean
  icon?: string
  secondaryText?: string
}>()
defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'secondary'): void
}>()
</script>

<style scoped>
.confirm-dialog {
  background: #fff;
  border-radius: var(--radius);
  width: 400px;
  max-width: 90vw;
  padding: 24px;
  text-align: center;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.2s ease;
}
.dialog-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.dialog-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 8px;
  white-space: pre-line;
}
.dialog-message {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
  white-space: pre-line;
  word-break: break-all;
}
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
.btn-danger-solid {
  background: var(--color-danger);
  color: #fff;
  border-color: var(--color-danger);
}
.btn-danger-solid:hover {
  background: #c0392b;
}
</style>
