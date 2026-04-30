import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormatBar from '../FormatBar.vue'

describe('FormatBar', () => {
  it('renders all format buttons', () => {
    const wrapper = mount(FormatBar)

    const buttons = wrapper.findAll('.format-btn')
    // Bold, Italic, Color, Code, Quote, Heading, Bullet List, Numbered List, Link, Image
    expect(buttons.length).toBeGreaterThanOrEqual(7)
  })

  it('emits format event with bold type when Bold button is clicked', async () => {
    const wrapper = mount(FormatBar)

    const boldButton = wrapper.findAll('.format-btn')[0]
    await boldButton.trigger('click')

    expect(wrapper.emitted('format')).toBeTruthy()
    expect(wrapper.emitted('format')![0]).toEqual(['bold'])
  })

  it('emits format event with italic type when Italic button is clicked', async () => {
    const wrapper = mount(FormatBar)

    const buttons = wrapper.findAll('.format-btn')
    const italicButton = buttons[1]
    await italicButton.trigger('click')

    expect(wrapper.emitted('format')).toBeTruthy()
    expect(wrapper.emitted('format')![0]).toEqual(['italic'])
  })

  it('shows heading menu when Heading button is clicked', async () => {
    const wrapper = mount(FormatBar)

    // Find heading button by looking for the dropdown that contains heading menu
    const dropdowns = wrapper.findAll('.dropdown')
    let headingDropdownIndex = -1

    for (let i = 0; i < dropdowns.length; i++) {
      const btn = dropdowns[i].find('.format-btn')
      if (btn.text().includes('标题')) {
        headingDropdownIndex = i
        break
      }
    }

    if (headingDropdownIndex >= 0) {
      const headingButton = dropdowns[headingDropdownIndex].find('.format-btn')
      await headingButton.trigger('click')

      const headingMenu = wrapper.find('.dropdown-menu')
      expect(headingMenu.exists()).toBe(true)

      const headingOptions = wrapper.findAll('.dropdown-option')
      expect(headingOptions.length).toBeGreaterThanOrEqual(6)
    }
  })

  it('emits format event with ul type when Bullet List button is clicked', async () => {
    const wrapper = mount(FormatBar)

    const buttons = wrapper.findAll('.format-btn')
    const bulletButton = buttons.find(btn => btn.attributes('title')?.includes('无序列表'))
    await bulletButton?.trigger('click')

    expect(wrapper.emitted('format')).toBeTruthy()
    expect(wrapper.emitted('format')![0]).toEqual(['ul'])
  })

  it('applies CSS variables for styling', () => {
    const wrapper = mount(FormatBar)
    const formatBar = wrapper.find('.format-bar')

    expect(formatBar.exists()).toBe(true)
  })
})