export const WINDOW_OPTIONS = {
  center: false,

  closable: false,
  frame: false,
  maximizable: false,
  minimizable: false,
  movable: false,
  resizable: false,
  thickFrame: false,

  autoHideMenuBar: true,
  enableLargerThanScreen: true,
  fullscreen: true,
  fullscreenable: true,
  kiosk: true,
  skipTaskbar: true,

  backgroundColor: "#000000",
  titleBarStyle: "hidden",

  webPreferences: {
    defaultEncoding: "utf8",

    devTools: true,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    enableRemoteModule: false,

    backgroundThrottling: false,
    spellcheck: false,
  },
}