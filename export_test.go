package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestExportToPDF_SimulateFrontendFlow simulates the exact call chain
// from frontend: markdown → renderMarkdown → exportMarkdownToHtml → ExportToPDF
func TestExportToPDF_SimulateFrontendFlow(t *testing.T) {
	edgePath := findEdgeOrChrome()
	if edgePath == "" {
		t.Skip("No Edge/Chrome found")
	}

	simulatedHTML := `<h1>Android 6.0 WifiService 架构与网卡交互机制</h1>
<blockquote><p>本文档基于 Android 6.0.1_r72 源码分析</p></blockquote>
<h2>目录</h2>
<ol><li>整体架构概览</li><li>核心组件详解</li></ol>
<h2>1. 整体架构概览</h2>
<p>Android 6.0 的 WiFi 系统采用分层架构。</p>
<pre><code>┌─────────────────────────────────┐
│  WifiService → WifiServiceImpl  │
└─────────────────────────────────┘</code></pre>
<p>包含中文、特殊字符 <code>&amp;</code>、百分号 100%、美元 $100。</p>`

	fullHTML := `<style>/* katex styles */</style>
` + simulatedHTML

	// Use the EXACT same path format as the real user would: Desktop with spaces
	pdfPath := filepath.Join(os.Getenv("USERPROFILE"), "Desktop", "Android6_WifiService_Architecture.pdf")
	defer os.Remove(pdfPath)

	t.Logf("Edge path: %s", edgePath)
	t.Logf("PDF output: %s", pdfPath)

	app := &App{}
	result := app.ExportToPDF(pdfPath, fullHTML, "Android6_WifiService_Architecture")

	if !result.Success {
		t.Fatalf("ExportToPDF failed: %s", result.Error)
	}

	// Verify PDF
	info, err := os.Stat(pdfPath)
	if err != nil {
		t.Fatalf("PDF not created: %v", err)
	}
	if info.Size() < 1000 {
		t.Fatalf("PDF too small (%d bytes), likely corrupted", info.Size())
	}

	f, _ := os.Open(pdfPath)
	header := make([]byte, 5)
	f.Read(header)
	f.Close()
	if string(header) != "%PDF-" {
		t.Fatalf("Not a valid PDF (header: %q)", string(header))
	}

	t.Logf("E2E PDF test passed: %s (%d bytes)", pdfPath, info.Size())
}

// TestExportToHTML_SimulateFrontendFlow tests HTML export end-to-end
func TestExportToHTML_SimulateFrontendFlow(t *testing.T) {
	simulatedHTML := `<h1>测试</h1><p>100% 完成</p><p>价格 $100</p>`

	app := &App{}
	htmlPath := filepath.Join(os.TempDir(), "qmmd_e2e_test.html")
	defer os.Remove(htmlPath)

	result := app.ExportToHTML(htmlPath, simulatedHTML, "测试文档")
	if !result.Success {
		t.Fatalf("ExportToHTML failed: %s", result.Error)
	}

	content, err := os.ReadFile(htmlPath)
	if err != nil {
		t.Fatalf("HTML not created: %v", err)
	}
	html := string(content)

	if !strings.Contains(html, "<!DOCTYPE html>") {
		t.Error("Missing DOCTYPE")
	}
	if !strings.Contains(html, "100%") {
		t.Error("Missing % character in output")
	}
	if !strings.Contains(html, "$100") {
		t.Error("Missing $ character in output")
	}
	if !strings.Contains(html, "<h1>测试</h1>") {
		t.Error("Missing content in body")
	}

	t.Logf("E2E HTML test passed: %s (%d bytes)", htmlPath, len(content))
}
