# QMMD

QMMD 是一个基于 Wails v2、Go、Vue 3、Vite 的 Windows 桌面 Markdown 编辑器。

## 本次新增

- 支持 KaTeX 数学公式渲染。
- 支持行内公式，例如：`行内公式：$E=mc^2$`
- 支持块级公式：

```md
$$
a^2+b^2=c^2
$$
```

- 行内代码里的 `$not_math$` 不会被渲染为公式。
- 常见价格文本，例如 `Price $5 and $6.`，不会被误渲染为公式。
- HTML/PDF 导出会保留公式渲染样式。

## 本地运行

如果本机没有全局安装 `wails` 命令，可以直接用 Go 运行 Wails CLI：

```powershell
go run github.com/wailsapp/wails/v2/cmd/wails@v2.12.0 dev
```

也可以先安装 Wails CLI：

```powershell
go install github.com/wailsapp/wails/v2/cmd/wails@v2.12.0
$env:Path += ";$env:USERPROFILE\go\bin"
wails dev
```

## 构建与安装

便携版 exe：

```powershell
wails build
```

生成文件：

```text
build\bin\qmmd.exe
```

本地使用时，单个 `qmmd.exe` 就可以运行。升级时先关闭旧程序，再用新生成的 `build\bin\qmmd.exe` 覆盖旧文件。

如果需要 Windows 安装包：

```powershell
wails build -nsis
```

未全局安装 `wails` 时：

```powershell
go run github.com/wailsapp/wails/v2/cmd/wails@v2.12.0 build -nsis
```

安装包会生成在 `build\bin` 下。升级安装版时，关闭 QMMD 后运行新版安装包，保持相同应用名和安装目录即可覆盖升级。

## 验证

```powershell
cd frontend
npm test
npm run build

cd ..
go test ./...
```

