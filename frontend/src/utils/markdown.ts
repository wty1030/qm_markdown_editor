import { Marked, type MarkedExtension, type MarkedOptions, type Tokens } from 'marked'
import katex from 'katex'

const katexOptions = {
  throwOnError: false,
  strict: 'warn' as const
}

interface MathToken extends Tokens.Generic {
  text: string
  displayMode: boolean
}

const isEscaped = (src: string, index: number) => {
  let slashCount = 0
  for (let i = index - 1; i >= 0 && src[i] === '\\'; i--) {
    slashCount++
  }
  return slashCount % 2 === 1
}

const isDigit = (char: string | undefined) => Boolean(char && /\d/.test(char))
const isWhitespace = (char: string | undefined) => Boolean(char && /\s/.test(char))

const parseInlineMath = (src: string): MathToken | undefined => {
  const delimiter = src.startsWith('$$') ? '$$' : src.startsWith('$') ? '$' : ''
  if (!delimiter) return

  const contentStart = delimiter.length
  const firstContentChar = src[contentStart]

  if (!firstContentChar || isWhitespace(firstContentChar)) return
  if (delimiter === '$' && isDigit(firstContentChar)) return

  for (let index = contentStart; index < src.length; index++) {
    if (src[index] !== '$' || isEscaped(src, index)) continue
    if (delimiter === '$$' && src[index + 1] !== '$') continue
    if (delimiter === '$' && src[index + 1] === '$') continue

    const contentEnd = index
    const content = src.slice(contentStart, contentEnd)
    const closingEnd = index + delimiter.length
    const lastContentChar = content[content.length - 1]

    if (!content.trim() || content.includes('\n')) return
    if (isWhitespace(lastContentChar)) return
    if (delimiter === '$' && isDigit(src[closingEnd])) return

    return {
      type: 'inlineMath',
      raw: src.slice(0, closingEnd),
      text: content.trim(),
      displayMode: delimiter === '$$'
    }
  }
}

const mathExtension: MarkedExtension = {
  extensions: [
    {
      name: 'blockMath',
      level: 'block',
      tokenizer(src) {
        const match = src.match(/^(\${1,2})\n((?:\\[^]|[^\\])+?)\n\1(?:\n|$)/)
        if (!match) return

        return {
          type: 'blockMath',
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2
        } as MathToken
      },
      renderer(token) {
        const mathToken = token as MathToken
        return `${katex.renderToString(mathToken.text, {
          ...katexOptions,
          displayMode: mathToken.displayMode
        })}\n`
      }
    },
    {
      name: 'inlineMath',
      level: 'inline',
      start(src) {
        for (let index = 0; index < src.length; index++) {
          if (src[index] !== '$' || isEscaped(src, index)) continue
          if (src[index + 1] === '$' && src[index + 2] === '$') continue
          if (isWhitespace(src[index + 1]) || isDigit(src[index + 1])) continue
          return index
        }
      },
      tokenizer(src) {
        return parseInlineMath(src)
      },
      renderer(token) {
        const mathToken = token as MathToken
        return katex.renderToString(mathToken.text, {
          ...katexOptions,
          displayMode: mathToken.displayMode
        })
      }
    }
  ]
}

export const createMarkdownParser = (options: MarkedOptions = {}) => {
  const parser = new Marked(mathExtension)
  parser.setOptions({
    breaks: true,
    gfm: true,
    ...options
  })

  return parser
}

export const renderMarkdown = (content: string, options: MarkedOptions = {}): string => {
  const html = createMarkdownParser(options).parse(content)
  return typeof html === 'string' ? html : ''
}
