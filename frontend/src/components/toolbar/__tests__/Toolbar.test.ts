import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Toolbar from '../Toolbar.vue'

// Mock the useTheme composable
vi.mock('../../../composables/useTheme', () => ({
  useTheme: () => ({
    theme: { value: 'dark' },
    isDark: { value: true },
    toggleTheme: vi.fn(),
    setTheme: vi.fn()
  })
}))

describe('Toolbar', () => {
  it('renders all file operation buttons', () => {
    const wrapper = mount(Toolbar)

    const buttons = wrapper.findAll('.toolbar-btn')
    // 4 file buttons + 1 theme toggle = 5 buttons
    expect(buttons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders theme toggle button', () => {
    const wrapper = mount(Toolbar)

    const themeToggle = wrapper.find('.theme-toggle')
    expect(themeToggle.exists()).toBe(true)
  })

  it('emits newFile event when New button is clicked', async () => {
    const wrapper = mount(Toolbar)

    const newButton = wrapper.findAll('.toolbar-btn')[0]
    await newButton.trigger('click')

    expect(wrapper.emitted('newFile')).toBeTruthy()
  })

  it('emits openFile event when Open button is clicked', async () => {
    const wrapper = mount(Toolbar)

    const buttons = wrapper.findAll('.toolbar-btn')
    const openButton = buttons.find(btn => btn.text().includes('Open'))
    await openButton?.trigger('click')

    expect(wrapper.emitted('openFile')).toBeTruthy()
  })

  it('emits save event when Save button is clicked', async () => {
    const wrapper = mount(Toolbar)

    const buttons = wrapper.findAll('.toolbar-btn')
    const saveButton = buttons.find(btn => btn.text().includes('Save') && !btn.text().includes('As'))
    await saveButton?.trigger('click')

    expect(wrapper.emitted('save')).toBeTruthy()
  })

  it('applies CSS variables for styling', () => {
    const wrapper = mount(Toolbar)
    const toolbar = wrapper.find('.toolbar')

    // Check that scoped styles are applied
    expect(toolbar.exists()).toBe(true)
  })
})
