const { app, BrowserWindow, powerSaveBlocker, globalShortcut, screen } = require("electron")
const { WINDOW_OPTIONS } = require("./window-options.js")
const ImageList = require("./image-list.js")

const URL = `file://${__dirname}/app/index.html`

const powerSaveID = powerSaveBlocker.start("prevent-display-sleep")

app.commandLine.appendSwitch("disable-http-cache")
app.commandLine.appendSwitch("disable-http2")
app.commandLine.appendSwitch("disable-renderer-backgrounding")
app.commandLine.appendSwitch("ignore-certificate-errors")
app.commandLine.appendSwitch("ignore-connections-limit", `localhost`)
app.commandLine.appendSwitch("ignore-gpu-blacklist")
app.commandLine.appendSwitch("no-proxy-server")
app.commandLine.appendSwitch("high-dpi-support", "1")
app.commandLine.appendSwitch("force-device-scale-factor", "1")

app.on("ready", main)
app.on("window-all-closed", exit)

let windows = []

function exit() {
  windows.forEach(w => w.close())
  powerSaveBlocker.stop(powerSaveID)
  app.exit()
  app.quit()
}

function reload() {
  windows.forEach(w => w.webContents.reloadIgnoringCache())
}

async function initViewPort() {
  const {id, x, y, width, height} = screen.getAllDisplays()[0].bounds

  let win = new BrowserWindow({
    ...WINDOW_OPTIONS,
    x: x + width / 4,
    y: y + height / 4,
    width: width / 2,
    height: height / 2
  })

  win.on("closed", () => {
    windows = windows.filter(w => w !== win)
    win = null
  })

  win.webContents.once("dom-ready", async () => {
    const imageList = await ImageList()
    const imageListBase64 = Buffer.from(JSON.stringify(imageList)).toString("base64")
    win.webContents.executeJavaScript(`
      window._ImageListBase64 = "${imageListBase64}"
      setTimeout(window._ShowImageSelector, 3000);
    `)
  })

  win.removeMenu()
  win.loadURL(URL)
  win.show()
  windows = [...windows, win]

  DEFINE_DEBUG && win.webContents.openDevTools()
}

async function initGlobalShortcut() {
  globalShortcut.register("F5", reload)
  globalShortcut.register("CommandOrControl+Q", exit)
}

async function main() {
  await initViewPort()
  await initGlobalShortcut()
}

