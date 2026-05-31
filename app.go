package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// FileInfo represents file or directory information
type FileInfo struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	IsDir   bool   `json:"isDir"`
	ModTime string `json:"modTime"`
}

// FileResult represents the result of a file operation
type FileResult struct {
	Success bool   `json:"success"`
	Content string `json:"content,omitempty"`
	Error   string `json:"error,omitempty"`
}

// App struct
type App struct {
	ctx         context.Context
	currentFile string
	startupFile string
}

// NewApp creates a new App application struct
func NewApp(startupFile string) *App {
	return &App{startupFile: startupFile}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ReadFile reads the content of a file
func (a *App) ReadFile(path string) FileResult {
	content, err := os.ReadFile(path)
	if err != nil {
		return FileResult{
			Success: false,
			Error:   fmt.Sprintf("无法读取文件: %v", err),
		}
	}

	a.currentFile = path
	return FileResult{
		Success: true,
		Content: string(content),
	}
}

// WriteFile writes content to a file
func (a *App) WriteFile(path, content string) FileResult {
	// Ensure directory exists
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return FileResult{
			Success: false,
			Error:   fmt.Sprintf("无法创建目录: %v", err),
		}
	}

	err := os.WriteFile(path, []byte(content), 0644)
	if err != nil {
		return FileResult{
			Success: false,
			Error:   fmt.Sprintf("无法写入文件: %v", err),
		}
	}

	a.currentFile = path
	return FileResult{
		Success: true,
	}
}

// SaveFile saves content to the current file
func (a *App) SaveFile(content string) FileResult {
	if a.currentFile == "" {
		return FileResult{
			Success: false,
			Error:   "没有打开的文件",
		}
	}
	return a.WriteFile(a.currentFile, content)
}

// GetCurrentFile returns the current file path
func (a *App) GetCurrentFile() string {
	return a.currentFile
}

// GetStartupFile returns the file path passed via command line args (drag onto exe),
// and clears it so it's only consumed once.
func (a *App) GetStartupFile() string {
	path := a.startupFile
	a.startupFile = ""
	return path
}

// ListDirectory lists files and directories in a path
func (a *App) ListDirectory(path string) ([]FileInfo, error) {
	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, fmt.Errorf("无法读取目录: %v", err)
	}

	var files []FileInfo
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}

		files = append(files, FileInfo{
			Name:    entry.Name(),
			Path:    filepath.Join(path, entry.Name()),
			IsDir:   entry.IsDir(),
			ModTime: info.ModTime().Format("2006-01-02 15:04:05"),
		})
	}

	return files, nil
}

// FileExists checks if a file exists
func (a *App) FileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// CreateFile creates a new empty file
func (a *App) CreateFile(path string) FileResult {
	file, err := os.Create(path)
	if err != nil {
		return FileResult{
			Success: false,
			Error:   fmt.Sprintf("无法创建文件: %v", err),
		}
	}
	file.Close()

	a.currentFile = path
	return FileResult{
		Success: true,
	}
}

// IsMarkdownFile checks if a file is a markdown file
func (a *App) IsMarkdownFile(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	return ext == ".md"
}

// NewFile clears the current file
func (a *App) NewFile() {
	a.currentFile = ""
}

// OpenFileDialog opens a file dialog and returns the selected file path
func (a *App) OpenFileDialog() string {
	result, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "打开 Markdown 文件",
		Filters: []runtime.FileFilter{
			{DisplayName: "Markdown 文件", Pattern: "*.md"},
		},
	})
	if err != nil {
		return ""
	}
	return result
}

// SaveFileDialog opens a save file dialog and returns the selected path
func (a *App) SaveFileDialog(defaultFilename string, filterType string) string {
	var filters []runtime.FileFilter
	var title string

	switch filterType {
	case "html":
		title = "导出为 HTML"
		filters = []runtime.FileFilter{
			{DisplayName: "HTML 文件", Pattern: "*.html;*.htm"},
			{DisplayName: "所有文件", Pattern: "*.*"},
		}
	case "pdf":
		title = "导出为 PDF"
		filters = []runtime.FileFilter{
			{DisplayName: "PDF 文件", Pattern: "*.pdf"},
			{DisplayName: "所有文件", Pattern: "*.*"},
		}
	default:
		title = "保存 Markdown 文件"
		filters = []runtime.FileFilter{
			{DisplayName: "Markdown 文件", Pattern: "*.md"},
			{DisplayName: "所有文件", Pattern: "*.*"},
		}
	}

	result, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           title,
		DefaultFilename: defaultFilename,
		Filters:         filters,
	})
	if err != nil {
		return ""
	}
	return result
}

// OpenDirectoryDialog opens a directory dialog and returns the selected path
func (a *App) OpenDirectoryDialog() string {
	result, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "打开文件夹",
	})
	if err != nil {
		return ""
	}
	return result
}

// ExportToHTML exports markdown content to an HTML file with embedded styles
func (a *App) ExportToHTML(path, content, title string) FileResult {
	// Generate HTML with embedded CSS
	htmlContent := generateHTMLDocument(content, title)

	err := os.WriteFile(path, []byte(htmlContent), 0644)
	if err != nil {
		return FileResult{
			Success: false,
			Error:   fmt.Sprintf("无法导出 HTML: %v", err),
		}
	}

	return FileResult{
		Success: true,
	}
}

// ExportToPDF exports markdown content to a real PDF file.
// Tries Edge/Chrome headless --print-to-pdf first, falls back to HTML + browser print.
func (a *App) ExportToPDF(path, content, title string) FileResult {
	htmlContent := generateHTMLDocumentForPDF(content, title)

	// Try Edge/Chrome headless to generate a real PDF
	if edgePath := findEdgeOrChrome(); edgePath != "" {
		// Write temp HTML file
		tmpHTML := strings.TrimSuffix(path, ".pdf") + "_tmp.html"
		if err := os.WriteFile(tmpHTML, []byte(htmlContent), 0644); err != nil {
			return FileResult{Success: false, Error: fmt.Sprintf("无法生成临时文件: %v", err)}
		}
		defer os.Remove(tmpHTML)

		absPath, _ := filepath.Abs(path)
		cmd := exec.Command(edgePath,
			"--headless",
			"--disable-gpu",
			"--no-pdf-header-footer",
			"--print-to-pdf="+absPath,
			tmpHTML,
		)
		if err := cmd.Run(); err == nil {
			if _, err := os.Stat(absPath); err == nil {
				return FileResult{Success: true}
			}
		}
	}

	// Fallback: write HTML and open browser for manual print
	htmlPath := strings.TrimSuffix(path, ".pdf") + ".html"
	if err := os.WriteFile(htmlPath, []byte(htmlContent), 0644); err != nil {
		return FileResult{Success: false, Error: fmt.Sprintf("无法生成 HTML 文件: %v", err)}
	}
	if err := openInBrowser(htmlPath); err != nil {
		return FileResult{Success: false, Error: fmt.Sprintf("无法打开浏览器: %v", err)}
	}
	return FileResult{Success: true}
}

// findEdgeOrChrome looks for Edge or Chrome executable on Windows
func findEdgeOrChrome() string {
	candidates := []string{
		filepath.Join(os.Getenv("ProgramFiles(x86)"), "Microsoft", "Edge", "Application", "msedge.exe"),
		filepath.Join(os.Getenv("ProgramFiles"), "Microsoft", "Edge", "Application", "msedge.exe"),
		filepath.Join(os.Getenv("LocalAppData"), "Google", "Chrome", "Application", "chrome.exe"),
		filepath.Join(os.Getenv("ProgramFiles"), "Google", "Chrome", "Application", "chrome.exe"),
		filepath.Join(os.Getenv("ProgramFiles(x86)"), "Google", "Chrome", "Application", "chrome.exe"),
	}
	for _, p := range candidates {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}

// OpenNewWindow opens a new instance of the application
func (a *App) OpenNewWindow() error {
	// Get the executable path
	exePath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("无法获取程序路径: %v", err)
	}

	// Start a new instance
	cmd := exec.Command(exePath)
	cmd.Start()

	return nil
}

// generateHTMLDocument creates a complete HTML document with embedded styles
func generateHTMLDocument(content, title string) string {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>` + title + `</title>
    <style>
        :root {
            --bg-primary: #ffffff;
            --text-primary: #333333;
            --text-secondary: #666666;
            --border-color: #d4d4d4;
            --accent-color: #0078d4;
            --preview-quote-border: #5a8a4a;
            --preview-quote-bg: rgba(90, 138, 74, 0.1);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background-color: var(--bg-primary);
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }

        h1 { font-size: 2em; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; margin: 1rem 0 0.5rem; }
        h2 { font-size: 1.5em; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; margin: 1rem 0 0.5rem; }
        h3 { font-size: 1.25em; font-weight: 600; margin: 1rem 0 0.5rem; }
        h4 { font-size: 1em; font-weight: 600; margin: 1rem 0 0.5rem; }
        h5 { font-size: 0.875em; font-weight: 600; margin: 1rem 0 0.5rem; }
        h6 { font-size: 0.85em; font-weight: 600; color: var(--text-secondary); margin: 1rem 0 0.5rem; }

        p { margin: 0 0 1rem; }

        a { color: var(--accent-color); text-decoration: none; }
        a:hover { text-decoration: underline; }

        code { background-color: #f3f3f3; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.9em; }
        pre { background-color: #f3f3f3; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 0 0 1rem; }
        pre code { background: none; padding: 0; font-size: 0.875em; }

        blockquote { border-left: 4px solid var(--preview-quote-border); background-color: var(--preview-quote-bg); padding: 0.5rem 1rem; margin: 0 0 1rem; color: var(--text-secondary); }

        ul, ol { padding-left: 2rem; margin: 0 0 1rem; }
        li { margin: 0.25rem 0; }

        table { border-collapse: collapse; width: 100%; margin: 0 0 1rem; }
        th, td { border: 1px solid var(--border-color); padding: 0.5rem 0.75rem; }
        th { background-color: #f3f3f3; font-weight: 600; }

        hr { border: none; border-top: 1px solid var(--border-color); margin: 1rem 0; }

        img { max-width: 100%; height: auto; }

        /* Syntax highlighting */
        .hljs { background: #f3f3f3; }
        .hljs-keyword { color: #0000ff; }
        .hljs-string { color: #a31515; }
        .hljs-number { color: #098658; }
        .hljs-comment { color: #008000; }
        .hljs-function { color: #795e26; }
        .hljs-variable { color: #001080; }
    </style>
</head>
<body>
` + content + `
</body>
</html>`
}

// generateHTMLDocumentForPDF creates HTML optimized for PDF printing
func generateHTMLDocumentForPDF(content, title string) string {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>` + title + `</title>
    <style>
        @media print {
            body { padding: 0; margin: 0; }
            .print-button { display: none; }
        }

        :root {
            --bg-primary: #ffffff;
            --text-primary: #333333;
            --text-secondary: #666666;
            --border-color: #d4d4d4;
            --accent-color: #0078d4;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background-color: var(--bg-primary);
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }

        .print-button {
            position: fixed;
            top: 1rem;
            right: 1rem;
            padding: 0.75rem 1.5rem;
            background-color: var(--accent-color);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
        }

        .print-button:hover {
            background-color: #1c97ea;
        }

        h1 { font-size: 2em; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; margin: 1rem 0 0.5rem; }
        h2 { font-size: 1.5em; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; margin: 1rem 0 0.5rem; }
        h3 { font-size: 1.25em; font-weight: 600; margin: 1rem 0 0.5rem; }
        h4 { font-size: 1em; font-weight: 600; margin: 1rem 0 0.5rem; }
        h5 { font-size: 0.875em; font-weight: 600; margin: 1rem 0 0.5rem; }
        h6 { font-size: 0.85em; font-weight: 600; color: var(--text-secondary); margin: 1rem 0 0.5rem; }

        p { margin: 0 0 1rem; }
        a { color: var(--accent-color); text-decoration: none; }
        code { background-color: #f3f3f3; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.9em; }
        pre { background-color: #f3f3f3; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 0 0 1rem; }
        pre code { background: none; padding: 0; }
        blockquote { border-left: 4px solid #5a8a4a; background-color: rgba(90, 138, 74, 0.1); padding: 0.5rem 1rem; margin: 0 0 1rem; color: var(--text-secondary); }
        ul, ol { padding-left: 2rem; margin: 0 0 1rem; }
        table { border-collapse: collapse; width: 100%; margin: 0 0 1rem; }
        th, td { border: 1px solid var(--border-color); padding: 0.5rem 0.75rem; }
        th { background-color: #f3f3f3; font-weight: 600; }
        hr { border: none; border-top: 1px solid var(--border-color); margin: 1rem 0; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">打印/保存为 PDF</button>
` + content + `
    <script>
        // Auto-trigger print dialog after page loads
        window.onload = function() {
            // Small delay to ensure content is rendered
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>`
}

// openInBrowser opens a file in the default system browser
func openInBrowser(path string) error {
	var cmd *exec.Cmd

	// Convert to absolute path
	absPath, err := filepath.Abs(path)
	if err != nil {
		return err
	}

	// Different commands for different OS
	switch {
	case strings.Contains(strings.ToLower(os.Getenv("OS")), "windows"):
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", absPath)
	case filepath.IsAbs("/usr/bin/open"):
		cmd = exec.Command("open", absPath)
	default:
		cmd = exec.Command("xdg-open", absPath)
	}

	return cmd.Start()
}
func (a *App) OpenInBrowser(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}

// MinimiseWindow minimises the window
func (a *App) MinimiseWindow() {
	runtime.WindowMinimise(a.ctx)
}

// ToggleMaximiseWindow toggles the window between maximised and normal
func (a *App) ToggleMaximiseWindow() {
	runtime.WindowToggleMaximise(a.ctx)
}

// CloseWindow closes the window
func (a *App) CloseWindow() {
	runtime.Quit(a.ctx)
}

// IsWindowMaximised returns whether the window is maximised
func (a *App) IsWindowMaximised() bool {
	return runtime.WindowIsMaximised(a.ctx)
}
