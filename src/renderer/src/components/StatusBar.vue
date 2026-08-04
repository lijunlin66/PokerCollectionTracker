<template>
  <footer class="status-bar">
    <span class="status-item">
      总张数：<strong>{{ stats.total }}</strong>
    </span>
    <span class="status-item">
      已收集：<strong>{{ stats.collected }}</strong>
    </span>
    <span class="status-item">
      未收集：<strong>{{ stats.total - stats.collected }}</strong>
    </span>
    <span class="status-item progress">
      收集进度：<strong>{{ stats.percentage }}%</strong>
      <div class="mini-progress">
        <div class="mini-fill" :style="{ width: stats.percentage + '%' }"></div>
      </div>
    </span>
  </footer>
</template>

<script setup lang="ts">
import type { CollectionStats } from '@shared/types'
defineProps<{ stats: CollectionStats }>()
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px 24px;
  background: var(--color-primary);
  color: #fff;
  font-size: 12px;
  flex-wrap: wrap;
}
.status-item strong {
  font-weight: 600;
  margin-left: 2px;
}
.status-item.progress {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.mini-progress {
  width: 120px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}
.mini-fill {
  height: 100%;
  background: var(--color-success);
  border-radius: 3px;
  transition: width 0.3s ease;
}
</style>
