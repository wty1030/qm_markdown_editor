import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('renders inline math with KaTeX', () => {
    const html = renderMarkdown('Energy: $E=mc^2$')

    expect(html).toContain('class="katex"')
    expect(html).toContain('E=mc^2')
  })

  it('renders inline math after Chinese text without requiring spaces', () => {
    const html = renderMarkdown('行内公式：$E=mc^2$')

    expect(html).toContain('class="katex"')
    expect(html).toContain('E=mc^2')
  })

  it('renders block math with display mode', () => {
    const html = renderMarkdown('$$\na^2+b^2=c^2\n$$')

    expect(html).toContain('class="katex-display"')
    expect(html).toContain('display="block"')
  })

  it('does not render dollar-delimited text inside code as math', () => {
    const html = renderMarkdown('`$not_math$`\n\n```js\nconst value = "$still_not_math$"\n```')

    expect(html).toContain('<code>$not_math$</code>')
    expect(html).toContain('const value = &quot;$still_not_math$&quot;')
    expect(html).not.toContain('class="katex"')
  })

  it('leaves unmatched currency-like dollars untouched', () => {
    const html = renderMarkdown('Price stays $5 and $6.')

    expect(html).toContain('Price stays $5 and $6.')
    expect(html).not.toContain('class="katex"')
  })
})
