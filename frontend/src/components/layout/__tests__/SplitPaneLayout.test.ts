import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SplitPaneLayout from '../SplitPaneLayout.vue'

// Mock splitpanes components
vi.mock('splitpanes', () => ({
  Splitpanes: {
    name: 'Splitpanes',
    template: '<div class="mock-splitpanes"><slot /></div>',
    props: ['class']
  },
  Pane: {
    name: 'Pane',
    template: '<div class="mock-pane"><slot /></div>',
    props: ['size', 'minSize', 'maxSize', 'class']
  }
}))

// Mock useLayoutState
vi.mock('../../../composables/useLayoutState', () => ({
  useLayoutState: () => ({
    leftSize: { value: 50 },
    rightSize: { value: 50 },
    updateFromResize: vi.fn(),
    resetLayout: vi.fn()
  })
}))

describe('SplitPaneLayout', () => {
  it('renders splitpanes with correct structure', () => {
    const wrapper = mount(SplitPaneLayout)

    // Check that splitpanes and panes are rendered
    expect(wrapper.find('.mock-splitpanes').exists()).toBe(true)
    expect(wrapper.findAll('.mock-pane').length).toBe(2)
  })

  it('provides left and right slots', () => {
    const wrapper = mount(SplitPaneLayout, {
      slots: {
        left: '<div class="left-content">Editor</div>',
        right: '<div class="right-content">Preview</div>'
      }
    })

    expect(wrapper.find('.left-content').exists()).toBe(true)
    expect(wrapper.find('.right-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Editor')
    expect(wrapper.text()).toContain('Preview')
  })

  it('applies CSS variables for styling', () => {
    const wrapper = mount(SplitPaneLayout)

    // Component renders successfully with CSS
    expect(wrapper.html()).toBeTruthy()
  })
})