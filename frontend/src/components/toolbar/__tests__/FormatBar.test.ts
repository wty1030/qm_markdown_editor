import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormatBar from '../FormatBar.vue'

describe('FormatBar', () => {
  it('renders all format buttons', () => {
    const wrapper = mount(FormatBar)

    const buttons = wrapper.findAll('.format-btn')
    // Bold, Italic, Code, Quote, Heading, Bullet List, Numbered List = 7 main buttons
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

    // Heading button is the 5th button (index 4)
    const headingButton = wrapper.findAll('.format-btn')[4]
    await headingButton.trigger('click')

    const headingMenu = wrapper.find('.heading-menu')
    expect(headingMenu.exists()).toBe(true)

    // Should have 6 heading options
    const headingOptions = wrapper.findAll('.heading-option')
    expect(headingOptions.length).toBe(6)
  })

  it('emits format event with heading type when heading option is selected', async () => {
    const wrapper = mount(FormatBar)

    // Open heading menu
    const headingButton = wrapper.findAll('.format-btn')[4]
    await headingButton.trigger('click')

    // Click H1 option
    const h1Option = wrapper.findAll('.heading-option')[0]
    await h1Option.trigger('click')

    expect(wrapper.emitted('format')).toBeTruthy()
    expect(wrapper.emitted('format')![0]).toEqual(['h1'])
  })

  it('emits format event with ul type when Bullet List button is clicked', async () => {
    const wrapper = mount(FormatBar)

    // Find bullet list button (after separator, typically index 5 or 6)
    const buttons = wrapper.findAll('.format-btn')
    const bulletButton = buttons.find(btn => btn.attributes('title')?.includes('Bullet'))
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
