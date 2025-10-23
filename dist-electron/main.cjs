"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const url_1 = require("url");
electron_1.app.commandLine.appendSwitch('enable-logging');
async function isServerRunning(url, timeout = 2000) {
    try {
        const u = new url_1.URL(url);
        const lib = u.protocol === 'https:' ? https_1.default : http_1.default;
        return await new Promise((resolve) => {
            const req = lib.request({ method: 'HEAD', hostname: u.hostname, port: u.port, path: u.pathname || '/', timeout }, (res) => {
                resolve(Boolean(res.statusCode && res.statusCode < 400));
            });
            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            req.end();
        });
    }
    catch {
        return false;
    }
}
async function createWindow() {
    const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 360,
        minHeight: 640,
        center: true,
        fullscreen: isDev, // Pantalla completa en modo desarrollo (oculta taskbar)
        autoHideMenuBar: true, // Ocultar barra de menú automáticamente
        frame: true, // Mantener el frame pero sin menú
        icon: (0, path_1.join)(__dirname, '..', 'src', 'assets', 'asopogua.png'),
        webPreferences: {
            preload: (0, path_1.join)(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    // Remover menú de la ventana específica (Windows/Linux)
    win.removeMenu();
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    try {
        const up = await isServerRunning(devUrl, 2000);
        if (up) {
            console.log('Electron loading dev URL:', devUrl);
            await win.loadURL(devUrl);
            win.webContents.openDevTools({ mode: 'undocked' });
            return;
        }
        else {
            console.warn('Dev server not reachable at', devUrl, '— falling back to local build');
        }
    }
    catch (err) {
        console.warn('Error checking dev server:', err);
    }
    const indexPath = (0, path_1.join)(__dirname, '..', 'dist', 'index.html');
    console.log('Electron loading file:', indexPath);
    await win.loadFile(indexPath);
}
electron_1.app.whenReady().then(() => {
    // Remover menú de la aplicación completamente (File, Edit, View, Window, Help)
    electron_1.Menu.setApplicationMenu(null);
    createWindow();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
