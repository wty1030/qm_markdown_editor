import { ref, computed } from 'vue'
import { marked } from 'marked'
import {
  ReadFile,
  WriteFile,
  SaveFile,
  ListDirectory,
  ExportToHTML,
  ExportToPDF,
  OpenNewWindow,
  OpenFileDialog,
  SaveFileDialog,
  OpenDirectoryDialog,
} from '../../wailsjs/go/main/App'

interface FileInfo {
  name: string
  path: string
  isDir: boolean
  modTime: string
}

interface FileResult {
  success: boolean
  content?: string
  error?: string
}

export type ExportFormat = 'md' | 'html' | 'pdf'

export function useFileOperations() {
  const currentFile = ref<string>('')
  const savedContent = ref<string>('')
  const isModified = computed(() => markdownContent.value !== savedContent.value)
  const fileTree = ref<FileInfo[]>([])
  const currentDirectory = ref<string>('')

  // 外部持有的 markdown 内容引用，需要由 App.vue 注入
  let markdownContent: { value: string } = { value: '' }

  const setContentRef = (ref: { value: string }) => {
    markdownContent = ref
  }

  const markSaved = (content: string) => {
    savedContent.value = content
  }

  const openNewWindow = async () => {
    await OpenNewWindow()
  }

  const openFile = async (): Promise<{ success: boolean; content?: string; error?: string }> => {
    try {
      const path = await OpenFileDialog()

      if (!path) {
        return { success: false, error: '未选择文件' }
      }

      const result = await ReadFile(path) as FileResult
      if (result.success) {
        currentFile.value = path
        markSaved(result.content || '')

        // 打开文件所在文件夹，自动选中该文件
        const sep = path.includes('\\') ? '\\' : '/'
        const lastSep = path.lastIndexOf(sep)
        const dir = lastSep > 0 ? path.substring(0, lastSep) : ''
        if (dir) {
          try {
            const files = await ListDirectory(dir) as FileInfo[]
            currentDirectory.value = dir
            fileTree.value = files
          } catch {
            // 文件夹加载失败不影响文件打开
          }
        }
      }
      return result
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const openFileByPath = async (path: string): Promise<{ success: boolean; content?: string; error?: string }> => {
    const result = await ReadFile(path) as FileResult
    if (result.success) {
      currentFile.value = path
      markSaved(result.content || '')
    }
    return result
  }

  const saveFile = async (content: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentFile.value) {
      return saveFileAs(content, 'md')
    }

    const result = await SaveFile(content) as FileResult
    if (result.success) {
      markSaved(content)
    }
    return result
  }

  const saveFileAs = async (content: string, format: ExportFormat = 'md'): Promise<{ success: boolean; error?: string }> => {
    try {
      const defaultName = getDefaultNameForFormat(format)
      const path = await SaveFileDialog(defaultName, format)

      if (!path) {
        return { success: false, error: '未选择保存位置' }
      }

      let result: FileResult

      if (format === 'html') {
        const title = getFileNameWithoutExtension(currentFile.value) || '未命名'
        // Convert Markdown to HTML before exporting
        const htmlContent = await marked.parse(content) as string
        result = await ExportToHTML(path, htmlContent, title) as FileResult
      } else if (format === 'pdf') {
        const title = getFileNameWithoutExtension(currentFile.value) || '未命名'
        // Convert Markdown to HTML before exporting
        const htmlContent = await marked.parse(content) as string
        result = await ExportToPDF(path, htmlContent, title) as FileResult
      } else {
        result = await WriteFile(path, content) as FileResult
      }

      if (result.success && format === 'md') {
        currentFile.value = path
        markSaved(content)
      }
      return result
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const openDirectory = async (): Promise<{ success: boolean; files?: FileInfo[]; error?: string }> => {
    try {
      const path = await OpenDirectoryDialog()

      if (!path) {
        return { success: false, error: '未选择文件夹' }
      }

      const files = await ListDirectory(path) as FileInfo[]
      currentDirectory.value = path
      fileTree.value = files
      return { success: true, files }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const refreshDirectory = async (): Promise<{ success: boolean; files?: FileInfo[]; error?: string }> => {
    if (!currentDirectory.value) {
      return { success: false, error: '未打开文件夹' }
    }

    try {
      const files = await ListDirectory(currentDirectory.value) as FileInfo[]
      fileTree.value = files
      return { success: true, files }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const getWindowTitle = () => {
    if (!currentFile.value) {
      return 'QMMD - 未命名'
    }
    const fileName = currentFile.value.split('/').pop() || currentFile.value.split('\\').pop() || currentFile.value
    return `QMMD - ${fileName}${isModified.value ? ' *' : ''}`
  }

  // Helper functions
  const getDefaultNameForFormat = (format: ExportFormat) => {
    const baseName = getFileNameWithoutExtension(currentFile.value) || 'untitled'
    switch (format) {
      case 'html':
        return `${baseName}.html`
      case 'pdf':
        return `${baseName}.pdf`
      default:
        return `${baseName}.md`
    }
  }

  const getFileNameWithoutExtension = (path: string) => {
    if (!path) return ''
    const fileName = path.split('/').pop() || path.split('\\').pop() || path
    const lastDot = fileName.lastIndexOf('.')
    return lastDot > 0 ? fileName.substring(0, lastDot) : fileName
  }

  return {
    currentFile,
    isModified,
    fileTree,
    currentDirectory,
    openNewWindow,
    openFile,
    openFileByPath,
    saveFile,
    saveFileAs,
    openDirectory,
    refreshDirectory,
    setContentRef,
    getWindowTitle
  }
}
