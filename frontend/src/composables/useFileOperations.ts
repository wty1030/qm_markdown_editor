import { ref, type Ref } from 'vue'

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

// Declare Wails bindings
declare global {
  interface Window {
    go?: {
      main?: {
        App?: {
          ReadFile: (path: string) => Promise<FileResult>
          WriteFile: (path: string, content: string) => Promise<FileResult>
          SaveFile: (content: string) => Promise<FileResult>
          GetCurrentFile: () => Promise<string>
          ListDirectory: (path: string) => Promise<FileInfo[]>
          FileExists: (path: string) => Promise<boolean>
          CreateFile: (path: string) => Promise<FileResult>
          NewFile: () => Promise<void>
          IsMarkdownFile: (path: string) => Promise<boolean>
          ExportToHTML: (path: string, content: string, title: string) => Promise<FileResult>
          ExportToPDF: (path: string, content: string, title: string) => Promise<FileResult>
          OpenNewWindow: () => Promise<void>
        }
      }
    }
    runtime?: {
      Browser?: {
        OpenFileDialog: (options: {
          Title?: string
          Filters?: Array<{ DisplayName: string; Pattern: string }>
        }) => Promise<string>
        SaveFileDialog: (options: {
          Title?: string
          DefaultFilename?: string
          Filters?: Array<{ DisplayName: string; Pattern: string }>
        }) => Promise<string>
        OpenDirectoryDialog: (options: {
          Title?: string
        }) => Promise<string>
      }
    }
  }
}

export type ExportFormat = 'md' | 'html' | 'pdf'

export function useFileOperations() {
  const currentFile = ref<string>('')
  const isModified = ref(false)
  const fileTree = ref<FileInfo[]>([])
  const currentDirectory = ref<string>('')

  const getApp = () => {
    if (typeof window !== 'undefined' && window.go?.main?.App) {
      return window.go.main.App
    }
    return null
  }

  const getRuntime = () => {
    if (typeof window !== 'undefined' && window.runtime?.Browser) {
      return window.runtime.Browser
    }
    return null
  }

  const openNewWindow = async () => {
    const app = getApp()
    if (app?.OpenNewWindow) {
      await app.OpenNewWindow()
    }
  }

  const openFile = async (): Promise<{ success: boolean; content?: string; error?: string }> => {
    const runtime = getRuntime()
    const app = getApp()

    if (!runtime?.OpenFileDialog || !app?.ReadFile) {
      return { success: false, error: 'Wails runtime not available' }
    }

    try {
      const path = await runtime.OpenFileDialog({
        Title: '打开 Markdown 文件',
        Filters: [
          { DisplayName: 'Markdown 文件', Pattern: '*.md;*.markdown' },
          { DisplayName: '所有文件', Pattern: '*.*' }
        ]
      })

      if (!path) {
        return { success: false, error: '未选择文件' }
      }

      const result = await app.ReadFile(path)
      if (result.success) {
        currentFile.value = path
        isModified.value = false
      }
      return result
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const openFileByPath = async (path: string): Promise<{ success: boolean; content?: string; error?: string }> => {
    const app = getApp()
    if (!app?.ReadFile) {
      return { success: false, error: 'Wails runtime not available' }
    }

    const result = await app.ReadFile(path)
    if (result.success) {
      currentFile.value = path
      isModified.value = false
    }
    return result
  }

  const saveFile = async (content: string): Promise<{ success: boolean; error?: string }> => {
    const app = getApp()

    if (!currentFile.value) {
      return saveFileAs(content, 'md')
    }

    if (!app?.SaveFile) {
      return { success: false, error: 'Wails runtime not available' }
    }

    const result = await app.SaveFile(content)
    if (result.success) {
      isModified.value = false
    }
    return result
  }

  const saveFileAs = async (content: string, format: ExportFormat = 'md'): Promise<{ success: boolean; error?: string }> => {
    const runtime = getRuntime()
    const app = getApp()

    if (!runtime?.SaveFileDialog || !app?.WriteFile) {
      return { success: false, error: 'Wails runtime not available' }
    }

    try {
      const filters = getFiltersForFormat(format)
      const defaultName = getDefaultNameForFormat(format)

      const path = await runtime.SaveFileDialog({
        Title: getTitleForFormat(format),
        DefaultFilename: defaultName,
        Filters: filters
      })

      if (!path) {
        return { success: false, error: '未选择保存位置' }
      }

      let result: FileResult

      if (format === 'html') {
        const title = getFileNameWithoutExtension(currentFile.value) || '未命名'
        result = await app.ExportToHTML(path, content, title)
      } else if (format === 'pdf') {
        const title = getFileNameWithoutExtension(currentFile.value) || '未命名'
        result = await app.ExportToPDF(path, content, title)
      } else {
        result = await app.WriteFile(path, content)
      }

      if (result.success && format === 'md') {
        currentFile.value = path
        isModified.value = false
      }
      return result
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const openDirectory = async (): Promise<{ success: boolean; files?: FileInfo[]; error?: string }> => {
    const runtime = getRuntime()
    const app = getApp()

    if (!runtime?.OpenDirectoryDialog || !app?.ListDirectory) {
      return { success: false, error: 'Wails runtime not available' }
    }

    try {
      const path = await runtime.OpenDirectoryDialog({
        Title: '打开文件夹'
      })

      if (!path) {
        return { success: false, error: '未选择文件夹' }
      }

      const files = await app.ListDirectory(path)
      currentDirectory.value = path
      fileTree.value = files
      return { success: true, files }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const refreshDirectory = async (): Promise<{ success: boolean; files?: FileInfo[]; error?: string }> => {
    const app = getApp()

    if (!currentDirectory.value || !app?.ListDirectory) {
      return { success: false, error: '未打开文件夹' }
    }

    try {
      const files = await app.ListDirectory(currentDirectory.value)
      fileTree.value = files
      return { success: true, files }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const markModified = () => {
    isModified.value = true
  }

  const getWindowTitle = () => {
    if (!currentFile.value) {
      return 'QMMD - 未命名'
    }
    const fileName = currentFile.value.split('/').pop() || currentFile.value.split('\\').pop() || currentFile.value
    return `QMMD - ${fileName}${isModified.value ? ' *' : ''}`
  }

  // Helper functions
  const getFiltersForFormat = (format: ExportFormat) => {
    switch (format) {
      case 'html':
        return [
          { DisplayName: 'HTML 文件', Pattern: '*.html;*.htm' },
          { DisplayName: '所有文件', Pattern: '*.*' }
        ]
      case 'pdf':
        return [
          { DisplayName: 'PDF 文件', Pattern: '*.pdf' },
          { DisplayName: '所有文件', Pattern: '*.*' }
        ]
      default:
        return [
          { DisplayName: 'Markdown 文件', Pattern: '*.md' },
          { DisplayName: '所有文件', Pattern: '*.*' }
        ]
    }
  }

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

  const getTitleForFormat = (format: ExportFormat) => {
    switch (format) {
      case 'html':
        return '导出为 HTML'
      case 'pdf':
        return '导出为 PDF'
      default:
        return '保存 Markdown 文件'
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
    markModified,
    getWindowTitle
  }
}