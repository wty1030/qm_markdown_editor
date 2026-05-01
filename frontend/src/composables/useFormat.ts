import { ref, type Ref } from 'vue'

export type FormatType =
  | 'bold'
  | 'italic'
  | 'code'
  | 'quote'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'ul'
  | 'ol'

export interface LinkData {
  text: string
  url: string
}

export interface ImageData {
  alt: string
  url: string
}

export interface CodeBlockData {
  language: string
}

export interface ColorData {
  color: string
}

export interface TableData {
  rows: number
  cols: number
}

// 预定义颜色列表
export const colorPresets = [
  { name: '默认', value: '' },
  { name: '红色', value: '#e53935' },
  { name: '橙色', value: '#fb8c00' },
  { name: '黄色', value: '#fdd835' },
  { name: '绿色', value: '#43a047' },
  { name: '青色', value: '#00acc1' },
  { name: '蓝色', value: '#1e88e5' },
  { name: '紫色', value: '#8e24aa' },
  { name: '粉色', value: '#d81b60' },
  { name: '灰色', value: '#757575' },
]

export function useFormat(editorRef: Ref<HTMLTextAreaElement | null>) {
  const wrapSelection = (before: string, after: string) => {
    if (!editorRef.value) return

    const textarea = editorRef.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    const selectedText = text.substring(start, end)
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)

    // Update value
    textarea.value = newText

    // Set cursor position
    if (selectedText.length === 0) {
      textarea.selectionStart = start + before.length
      textarea.selectionEnd = start + before.length
    } else {
      textarea.selectionStart = start + before.length
      textarea.selectionEnd = start + before.length + selectedText.length
    }

    textarea.focus()
    textarea.dispatchEvent(new Event('input', { bubbles: true }))

    return newText
  }

  const insertAtCursor = (text: string) => {
    if (!editorRef.value) return

    const textarea = editorRef.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentText = textarea.value

    const newText = currentText.substring(0, start) + text + currentText.substring(end)

    textarea.value = newText
    textarea.selectionStart = start + text.length
    textarea.selectionEnd = start + text.length

    textarea.focus()
    textarea.dispatchEvent(new Event('input', { bubbles: true }))

    return newText
  }

  const insertLineBefore = (prefix: string) => {
    if (!editorRef.value) return

    const textarea = editorRef.value
    const start = textarea.selectionStart
    const text = textarea.value

    // Find the start of the current line
    let lineStart = start
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
      lineStart--
    }

    const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart)

    textarea.value = newText
    textarea.selectionStart = start + prefix.length
    textarea.selectionEnd = start + prefix.length

    textarea.focus()
    textarea.dispatchEvent(new Event('input', { bubbles: true }))

    return newText
  }

  const format = (type: FormatType, content: Ref<string>): string | undefined => {
    switch (type) {
      case 'bold':
        return wrapSelection('**', '**')

      case 'italic':
        return wrapSelection('*', '*')

      case 'code':
        return wrapSelection('`', '`')

      case 'quote':
        return insertLineBefore('> ')

      case 'h1':
        return insertLineBefore('# ')

      case 'h2':
        return insertLineBefore('## ')

      case 'h3':
        return insertLineBefore('### ')

      case 'h4':
        return insertLineBefore('#### ')

      case 'h5':
        return insertLineBefore('##### ')

      case 'h6':
        return insertLineBefore('###### ')

      case 'ul':
        return insertLineBefore('- ')

      case 'ol':
        return insertLineBefore('1. ')

      default:
        return undefined
    }
  }

  const insertLink = (data: LinkData, content: Ref<string>): string | undefined => {
    const text = data.text || '链接'
    const url = data.url || 'https://example.com'
    return insertAtCursor(`[${text}](${url})`)
  }

  const insertImage = (data: ImageData, content: Ref<string>): string | undefined => {
    const alt = data.alt || '图片'
    const url = data.url || 'https://example.com/image.png'
    return insertAtCursor(`![${alt}](${url})`)
  }

  const insertCodeBlock = (data: CodeBlockData, content: Ref<string>): string | undefined => {
    const lang = data.language || ''
    const codeTemplate = lang
      ? `\`\`\`${lang}\n代码内容\n\`\`\`\n`
      : `\`\`\`\n代码内容\n\`\`\`\n`
    return insertAtCursor(codeTemplate)
  }

  const insertColor = (data: ColorData, content: Ref<string>): string | undefined => {
    if (!editorRef.value) return

    const textarea = editorRef.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    const selectedText = text.substring(start, end) || '文字'

    // 使用 HTML span 标签来设置颜色
    const coloredText = `<span style="color: ${data.color}">${selectedText}</span>`

    const newText = text.substring(0, start) + coloredText + text.substring(end)

    textarea.value = newText
    textarea.selectionStart = start
    textarea.selectionEnd = start + coloredText.length

    textarea.focus()
    textarea.dispatchEvent(new Event('input', { bubbles: true }))

    return newText
  }

  const insertTable = (data: TableData, content: Ref<string>): string | undefined => {
    const rows = Math.max(1, data.rows || 3)
    const cols = Math.max(1, data.cols || 3)

    // 构建表格 Markdown
    let table = ''

    // 表头行
    table += '|'
    for (let c = 0; c < cols; c++) {
      table += ` 标题${c + 1} |`
    }
    table += '\n'

    // 分隔行
    table += '|'
    for (let c = 0; c < cols; c++) {
      table += ' --- |'
    }
    table += '\n'

    // 数据行
    for (let r = 1; r < rows; r++) {
      table += '|'
      for (let c = 0; c < cols; c++) {
        table += ' 内容 |'
      }
      table += '\n'
    }

    return insertAtCursor(table)
  }

  return {
    format,
    wrapSelection,
    insertAtCursor,
    insertLineBefore,
    insertLink,
    insertImage,
    insertCodeBlock,
    insertColor,
    insertTable
  }
}