<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { useLayoutState } from '../../composables/useLayoutState'

const { leftSize, updateFromResize } = useLayoutState()
</script>

<template>
  <Splitpanes
    class="split-pane-layout"
    @resize="updateFromResize"
  >
    <Pane
      :size="leftSize"
      :min-size="20"
      :max-size="80"
      class="left-pane"
    >
      <slot name="left" />
    </Pane>
    <Pane
      :size="100 - leftSize"
      class="right-pane"
    >
      <slot name="right" />
    </Pane>
  </Splitpanes>
</template>

<style scoped>
.split-pane-layout {
  height: 100%;
  background-color: transparent;
}

.left-pane,
.right-pane {
  background-color: transparent;
  overflow: hidden;
}
</style>

<style>
/* 分割线样式 - 非 scoped 以穿透 splitpanes 内部 */
.split-pane-layout {
  background-color: transparent;
}

.split-pane-layout .splitpanes__splitter {
  background-color: var(--border-color) !important;
  border: none !important;
  position: relative;
  width: 6px !important;
  min-width: 6px !important;
}

.split-pane-layout .splitpanes__splitter::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 40px;
  background-color: var(--text-secondary);
  border-radius: 2px;
  transition: background-color 0.15s ease;
}

.split-pane-layout .splitpanes__splitter:hover {
  background-color: var(--accent-color) !important;
}

.split-pane-layout .splitpanes__splitter:hover::before {
  background-color: var(--btn-text);
}

/* 确保 splitpanes 内部面板透明 */
.split-pane-layout .splitpanes__pane {
  background-color: transparent !important;
}
</style>