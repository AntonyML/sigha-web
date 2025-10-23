
import { app, BrowserWindow, Menu } from 'electron'
import { join } from 'path'
import http from 'http'
import https from 'https'
import { URL } from 'url'

app.commandLine.appendSwitch('enable-logging')

async function isServerRunning(url: string, timeout = 2000): Promise<boolean> {
  try {
    const u = new URL(url)
    const lib = u.protocol === 'https:' ? https : http
    return await new Promise<boolean>((resolve) => {
      const req = lib.request(
        { method: 'HEAD', hostname: u.hostname, port: u.port, path: u.pathname || '/', timeout },
        (res) => {
          resolve(Boolean(res.statusCode && res.statusCode < 400))
        },
      )
      req.on('error', () => resolve(false))
      req.on('timeout', () => {
        req.destroy()
        resolve(false)
      })
      req.end()
    })
  } catch {
    return false
  }
}

async function createWindow() {
  const isDev = process.env.VITE_DEV_SERVER_URL !== undefined
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 360,
    minHeight: 640,
    center: true,
    fullscreen: isDev, // Pantalla completa en modo desarrollo (oculta taskbar)
    autoHideMenuBar: true, // Ocultar barra de menú automáticamente
    frame: true, // Mantener el frame pero sin menú
    icon: join(__dirname, '..', 'src', 'assets', 'asopogua.png'), 
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Remover menú de la ventana específica (Windows/Linux)
  win.removeMenu()

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

  try {
    const up = await isServerRunning(devUrl, 2000)
    if (up) {
      console.log('Electron loading dev URL:', devUrl)
      await win.loadURL(devUrl)
      win.webContents.openDevTools({ mode: 'undocked' })
      return
       } else {
      console.warn('Dev server not reachable at', devUrl, '— falling back to local build')
    }
  } catch (err) {
    console.warn('Error checking dev server:', err)
  }

  const indexPath = join(__dirname, '..', 'dist', 'index.html')
  console.log('Electron loading file:', indexPath)
  await win.loadFile(indexPath)
}

app.whenReady().then(() => {
  // Remover menú de la aplicación completamente (File, Edit, View, Window, Help)
  Menu.setApplicationMenu(null)
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
