package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestGenerateHTMLDocument_ContentWithPercent(t *testing.T) {
	title := "测试文档"
	content := `<p>折扣 50%，价格 $100</p>
<p>KaTeX 输出: <span class="katex">x%</span></p>
<pre><code>echo "100% done"
</code></pre>`

	html := generateHTMLDocument(content, title)

	if !strings.Contains(html, title) {
		t.Error("HTML should contain the title")
	}
	if !strings.Contains(html, content) {
		t.Error("HTML should contain the content verbatim")
	}
	if !strings.Contains(html, "50%") {
		t.Error("HTML should preserve % characters in content")
	}
	if !strings.Contains(html, "100%") {
		t.Error("HTML should preserve % characters in code blocks")
	}
}

func TestGenerateHTMLDocumentForPDF_ContentWithPercent(t *testing.T) {
	title := "测试PDF"
	content := `<p>100% 完成</p>`

	html := generateHTMLDocumentForPDF(content, title)

	if !strings.Contains(html, content) {
		t.Error("PDF HTML should contain the content verbatim")
	}
	if !strings.Contains(html, "100%") {
		t.Error("PDF HTML should preserve % characters")
	}
	if !strings.Contains(html, "打印/保存为 PDF") {
		t.Error("PDF HTML should contain print button")
	}
}

func TestGenerateHTMLDocument_BasicStructure(t *testing.T) {
	html := generateHTMLDocument("<p>Hello</p>", "Test")

	if !strings.HasPrefix(html, "<!DOCTYPE html>") {
		t.Error("HTML should start with DOCTYPE")
	}
	if !strings.Contains(html, "<title>Test</title>") {
		t.Error("HTML should contain title tag")
	}
	if !strings.Contains(html, "<p>Hello</p>") {
		t.Error("HTML should contain body content")
	}
}

func TestFindEdgeOrChrome(t *testing.T) {
	path := findEdgeOrChrome()
	// On most Windows machines, Edge should be found
	if path == "" {
		t.Log("No Edge/Chrome found (OK if not installed)")
	} else {
		t.Logf("Found browser: %s", path)
	}
}

func TestExportToPDF_RealFile(t *testing.T) {
	edgePath := findEdgeOrChrome()
	if edgePath == "" {
		t.Skip("No Edge/Chrome found, skipping PDF test")
	}

	app := &App{}
	pdfPath := filepath.Join(os.TempDir(), "qmmd_test_export.pdf")
	defer os.Remove(pdfPath)

	content := `<h1>测试标题</h1><p>这是一段<strong>加粗</strong>文本。</p><ul><li>列表项1</li><li>列表项2</li></ul>`
	result := app.ExportToPDF(pdfPath, content, "测试文档")

	if !result.Success {
		t.Fatalf("ExportToPDF failed: %s", result.Error)
	}

	info, err := os.Stat(pdfPath)
	if err != nil {
		t.Fatalf("PDF file not created: %v", err)
	}
	if info.Size() < 100 {
		t.Fatalf("PDF file too small (%d bytes), likely corrupted", info.Size())
	}

	// Verify it starts with PDF magic bytes
	f, _ := os.Open(pdfPath)
	header := make([]byte, 5)
	f.Read(header)
	f.Close()
	if string(header) != "%PDF-" {
		t.Fatalf("File is not a valid PDF (header: %q)", string(header))
	}

	t.Logf("PDF exported successfully: %s (%d bytes)", pdfPath, info.Size())
}
