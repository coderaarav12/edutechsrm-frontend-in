const { app, BrowserWindow, Tray, Menu, nativeImage } = require("electron")
const { spawn } = require("child_process")
const path = require("path")
const http = require("http")

const PORT = 3456
let mainWindow = null, tray = null, server = null

// ── Start Next.js server ───────────────────────────────────────
function startNextServer() {
  return new Promise((resolve, reject) => {
    const cmd = `npx next start --port ${PORT}`
    server = spawn(cmd, [], {
      cwd: path.join(__dirname, ".."),
      stdio: ["ignore", "pipe", "pipe"], shell: true, windowsHide: true,
    })
    let done = false
    const onData = (d) => { if (!done && d.toString().includes("started")) { done = true; resolve() } }
    server.stdout.on("data", onData)
    server.stderr.on("data", onData)
    server.on("error", reject)
    server.on("exit", (c) => { if (!done) reject(new Error(`exited ${c}`)) })
    const poll = () => {
      const r = http.get(`http://localhost:${PORT}`, () => { if (!done) { done = true; resolve() } })
      r.on("error", () => setTimeout(poll, 500))
    }
    setTimeout(poll, 1500)
    setTimeout(() => { if (!done) { done = true; resolve() } }, 20000)
  })
}

// ── Window ─────────────────────────────────────────────────────
function createWindow() {
  if (mainWindow) { mainWindow.show(); mainWindow.focus(); return }
  mainWindow = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 600,
    icon: path.join(__dirname, "..", "public", "icon-192-v2.png"),
    title: "EduTechSRM", autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  })
  mainWindow.loadURL(`http://localhost:${PORT}`)
  mainWindow.on("closed", () => { mainWindow = null })
}

// ── Tray ───────────────────────────────────────────────────────
function createTray() {
  let icon = nativeImage.createFromPath(path.join(__dirname, "..", "public", "icon-192-v2.png"))
  if (icon.isEmpty()) icon = nativeImage.createEmpty()
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  tray.setToolTip("EduTechSRM")
  const menu = Menu.buildFromTemplate([
    { label: "Open Dashboard", click: () => createWindow() },
    { type: "separator" },
    { label: "Refresh", click: () => { if (mainWindow) mainWindow.webContents.reload() } },
    { type: "separator" },
    { label: "Quit", click: () => { app.isQuitting = true; app.quit() } },
  ])
  tray.setContextMenu(menu)
  tray.on("double-click", () => createWindow())
}

// ── App ────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  try { await startNextServer() } catch (e) { console.error("Server error:", e) }
  createWindow()
  createTray()
})

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit() })
app.on("before-quit", () => {
  app.isQuitting = true
  if (server) { server.kill(); server = null }
})
app.on("activate", () => createWindow())
