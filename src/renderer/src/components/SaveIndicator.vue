<template>
  <transition name="indicator">
    <div v-if="visible" class="save-indicator" :class="{ saving: show }">
      <span class="indicator-icon">{{ show ? '💾' : '✓' }}</span>
      <span class="indicator-text">{{ show ? '保存中...' : '已保存' }}</span>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  savedAt: string | null
}>()

const visible = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null
let savedTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.show,
  (saving) => {
    if (saving) {
      // 保存中：立即显示
      if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
      }
      if (savedTimer) {
        clearTimeout(savedTimer)
        savedTimer = null
      }
      visible.value = true
    }
  }
)

watch(
  () => props.savedAt,
  (at) => {
    if (at && !props.show) {
      // 已保存：切换到"已保存"状态，2 秒后淡出
      visible.value = true
      if (hideTimer) clearTimeout(hideTimer)
      hideTimer = setTimeout(() => {
        visible.value = false
      }, 2000)
    }
  }
)

// 保存中 → 已保存的过渡
watch(
  () => props.show,
  (saving, prev) => {
    if (!saving && prev) {
      // 刚从保存中切到非保存，等 savedAt 触发
    }
  }
)
</script>

<style scoped>
.save-indicator {
  position: fixed;
  bottom: 50px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--color-primary);
  color: #fff;
  border-radius: 20px;
  font-size: 12px;
  box-shadow: var(--shadow-md);
  z-index: 500;
}
.save-indicator.saving {
  background: var(--color-accent);
}
.indicator-icon {
  font-size: 13px;
}
.indicator-enter-active,
.indicator-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.indicator-enter-from,
.indicator-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
