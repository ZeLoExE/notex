const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'NoTex',
    backgroundColor: '#0a0a1a',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0a1a',
      symbolColor: '#9ca3af',
      height: 36,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the React app — in dev it's the Vite dev server, in production it's the built dist
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC: open native file dialog and return file contents
ipcMain.handle('open-files', async () => {
  if (!mainWindow) return { files: [], error: 'No window' };

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Notes',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Supported Files', extensions: ['txt', 'md', 'json'] },
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'JSON Files', extensions: ['json'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { files: [], canceled: true };
  }

  const files = [];
  const errors = [];

  for (const filePath of result.filePaths) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();
      const baseName = path.basename(filePath, ext);

      files.push({ path: filePath, name: baseName, ext, content });
    } catch (err) {
      errors.push({ path: filePath, error: err.message });
    }
  }

  return { files, errors, canceled: false };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
