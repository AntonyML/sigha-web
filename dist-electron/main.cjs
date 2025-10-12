"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { app, BrowserWindow } = require("electron");
const { join } = require("path");
function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(devUrl);
    }
    else {
        // production: load the built renderer
        win.loadFile(join(__dirname, '..', 'dist', 'index.html'));
    }
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
