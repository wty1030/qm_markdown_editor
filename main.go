package main

import (
	"embed"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	// os.Args[1] may contain a file path (e.g. dragged onto exe)
	startupFile := ""
	if len(os.Args) > 1 {
		startupFile = os.Args[1]
	}
	app := NewApp(startupFile)

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "QMMD - Markdown Editor",
		Width:  1280,
		Height: 800,
		MinWidth: 800,
		MinHeight: 600,
		Frameless: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 30, G: 30, B: 30, A: 1},
		OnStartup:        app.startup,
		DragAndDrop: &options.DragAndDrop{
			EnableFileDrop: true,
		},
		Bind: []interface{}{
			app,
		},
		Windows: &windows.Options{
			WindowIsTranslucent: false,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}