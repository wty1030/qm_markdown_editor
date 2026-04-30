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
  background-color: var(--bg-primary);
}

.split-pane-layout .splitpanes__splitter {
  background-color: var(--pane-separator);
  border: none;
  position: relative;
}

.split-pane-layout .splitpanes__splitter::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 40px;
  background-color: var(--border-color);
  border-radius: 2px;
  opacity: 0.5;
  transition: opacity 0.15s ease;
}

.split-pane-layout .splitpanes__splitter:hover::before {
  opacity: 1;
  background-color: var(--accent-color);
}

.left-pane,
.right-pane {
  background-color: var(--bg-primary);
  overflow: hidden;
}
</style>