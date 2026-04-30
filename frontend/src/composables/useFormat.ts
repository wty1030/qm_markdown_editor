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

  return {
    format,
    wrapSelection,
    insertAtCursor,
    insertLineBefore
  }
}