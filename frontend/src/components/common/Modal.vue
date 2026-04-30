<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  visible: boolean
  title: string
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'url'
    placeholder?: string
    value?: string
  }>
  confirmText?: string
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确定'
})

const emit = defineEmits<{
  close: []
  confirm: [values: Record<string, string>]
}>()

const formValues = ref<Record<string, string>>({})

watch(() => props.visible, (visible) => {
  if (visible) {
    // 初始化表单值
    formValues.value = {}
    props.fields.forEach(field => {
      formValues.value[field.key] = field.value || ''
    })
  }
})

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm', { ...formValues.value })
  handleClose()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="modal-overlay"
      @click.self="handleClose"
      @keydown="handleKeydown"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" @click="handleClose" aria-label="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div
            v-for="field in fields"
            :key="field.key"
            class="form-field"
          >
            <label :for="field.key">{{ field.label }}</label>
            <input
              :id="field.key"
              v-model="formValues[field.key]"
              :type="field.type"
              :placeholder="field.placeholder"
              @keydown.enter="handleConfirm"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="handleClose">取消</button>
          <button class="btn btn-confirm" @click="handleConfirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--dropdown-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-toolbar);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  min-width: 360px;
  max-width: 480px;
  box-shadow: 0 8px 32px var(--dropdown-shadow);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.modal-close:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 1.25rem;
}

.form-field {
  margin-bottom: 1rem;
}

.form-field:last-child {
  margin-bottom: 0;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.form-field input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.form-field input::placeholder {
  color: var(--text-muted);
}

.form-field input:focus {
  border-color: var(--accent-color);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-cancel {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-cancel:hover {
  background-color: var(--bg-hover);
}

.btn-confirm {
  background-color: var(--accent-color);
  color: var(--btn-text);
}

.btn-confirm:hover {
  background-color: var(--accent-hover);
}
</style>
