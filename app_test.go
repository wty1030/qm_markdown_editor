package main

import (
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
