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

  const newFile = async () => {
    const app = getApp()
    if (app?.NewFile) {
      await app.NewFile()
    }
    currentFile.value = ''
    isModified.value = false
  }

  const openFile = async (): Promise<{ success: boolean; content?: string; error?: string }> => {
    const runtime = getRuntime()
    const app = getApp()

    if (!runtime?.OpenFileDialog || !app?.ReadFile) {
      // Fallback for development mode
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
      return saveFileAs(content)
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

  const saveFileAs = async (content: string): Promise<{ success: boolean; error?: string }> => {
    const runtime = getRuntime()
    const app = getApp()

    if (!runtime?.SaveFileDialog || !app?.WriteFile) {
      return { success: false, error: 'Wails runtime not available' }
    }

    try {
      const path = await runtime.SaveFileDialog({
        Title: '保存 Markdown 文件',
        DefaultFilename: 'untitled.md',
        Filters: [
          { DisplayName: 'Markdown 文件', Pattern: '*.md' },
          { DisplayName: '所有文件', Pattern: '*.*' }
        ]
      })

      if (!path) {
        return { success: false, error: '未选择保存位置' }
      }

      const result = await app.WriteFile(path, content)
      if (result.success) {
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

  return {
    currentFile,
    isModified,
    fileTree,
    currentDirectory,
    newFile,
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