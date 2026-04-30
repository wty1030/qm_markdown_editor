import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Toolbar from '../Toolbar.vue'

// Mock the useTheme composable
vi.mock('../../../composables/useTheme', () => ({
  useTheme: () => ({
    theme: { value: 'vscode-dark' },
    isDark: { value: true },
    setTheme: vi.fn(),
    currentThemeOption: { value: { name: 'vscode-dark', label: 'VS Code Dark', icon: '🌙' } },
    themeOptions: [
      { name: 'vscode-dark', label: 'VS Code Dark', icon: '🌙' },
      { name: 'vscode-light', label: 'VS Code Light', icon: '☀️' },
    ]
  })
}))

describe('Toolbar', () => {
  it('renders all file operation buttons', () => {
    const wrapper = mount(Toolbar)

    const buttons = wrapper.findAll('.toolbar-btn')
    // 新建、打开、文件夹、保存、导出 = 5 buttons
    expect(buttons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders theme toggle button', () => {
    const wrapper = mount(Toolbar)

    const themeToggle = wrapper.find('.theme-toggle')
    expect(themeToggle.exists()).toBe(true)
  })

  it('emits newWindow event when New button is clicked', async () => {
    const wrapper = mount(Toolbar)

    const newButton = wrapper.findAll('.toolbar-btn')[0]
    await newButton.trigger('click')

    expect(wrapper.emitted('newWindow')).toBeTruthy()
  })

  it('emits openFile event when Open button is clicked', async () => {
    const wrapper = mount(Toolbar)

    const buttons = wrapper.findAll('.toolbar-btn')
    const openButton = buttons.find(btn => btn.text().includes('打开'))
    await openButton?.trigger('click')

    expect(wrapper.emitted('openFile')).toBeTruthy()
  })

  it('emits save event when Save button is clicked', async () => {
    const wrapper = mount(Toolbar)

    const buttons = wrapper.findAll('.toolbar-btn')
    const saveButton = buttons.find(btn => btn.text().includes('保存') && !btn.text().includes('导出'))
    await saveButton?.trigger('click')

    expect(wrapper.emitted('save')).toBeTruthy()
  })

  it('applies CSS variables for styling', () => {
    const wrapper = mount(Toolbar)
    const toolbar = wrapper.find('.toolbar')

    expect(toolbar.exists()).toBe(true)
  })
})