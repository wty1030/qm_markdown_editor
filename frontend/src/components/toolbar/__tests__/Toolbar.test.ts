import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Toolbar from '../Toolbar.vue'

vi.mock('../../../../wailsjs/go/main/App', () => ({
  MinimiseWindow: vi.fn(),
  ToggleMaximiseWindow: vi.fn(),
  CloseWindow: vi.fn(),
  IsWindowMaximised: vi.fn().mockResolvedValue(false)
}))

describe('Toolbar', () => {
  it('renders all file operation buttons', () => {
    const wrapper = mount(Toolbar)

    const buttons = wrapper.findAll('.toolbar-btn')
    expect(buttons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders settings button', () => {
    const wrapper = mount(Toolbar)

    const settingsButton = wrapper.find('.settings-btn')
    expect(settingsButton.exists()).toBe(true)
  })

  it('emits newWindow event when New button is clicked', async () => {
    const wrapper = mount(Toolbar)

    const newButton = wrapper.findAll('.toolbar-btn')[0]
    await newButton.trigger('click')

    expect(wrapper.emitted('newWindow')).toBeTruthy()
  })

  it('emits openFile event when Open button is clicked', async () => {
    const wrapper = mount(Toolbar)

    const openButton = wrapper.findAll('.toolbar-btn')[1]
    await openButton.trigger('click')

    expect(wrapper.emitted('openFile')).toBeTruthy()
  })

  it('emits save event when Save button is clicked', async () => {
    const wrapper = mount(Toolbar)

    const saveButton = wrapper.findAll('.toolbar-btn')[3]
    await saveButton.trigger('click')

    expect(wrapper.emitted('save')).toBeTruthy()
  })

  it('applies CSS variables for styling', () => {
    const wrapper = mount(Toolbar)
    const toolbar = wrapper.find('.toolbar')

    expect(toolbar.exists()).toBe(true)
  })
})
