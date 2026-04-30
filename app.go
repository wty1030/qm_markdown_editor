package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
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
	ctx       context.Context
	currentFile string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
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

// OpenFileDialog opens a file dialog and returns the selected path
func (a *App) OpenFileDialog() (string, error) {
	// This will be handled by Wails runtime
	// For now, return empty - frontend will use Wails runtime directly
	return "", nil
}

// SaveFileDialog opens a save file dialog and returns the selected path
func (a *App) SaveFileDialog() (string, error) {
	// This will be handled by Wails runtime
	return "", nil
}

// OpenDirectoryDialog opens a directory dialog and returns the selected path
func (a *App) OpenDirectoryDialog() (string, error) {
	// This will be handled by Wails runtime
	return "", nil
}

// IsMarkdownFile checks if a file is a markdown file
func (a *App) IsMarkdownFile(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	return ext == ".md" || ext == ".markdown" || ext == ".mdown"
}

// NewFile clears the current file
func (a *App) NewFile() {
	a.currentFile = ""
}