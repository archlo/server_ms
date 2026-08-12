const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');

let mainWindow = null;
let serverProcess = null;
let serverLogBuffer = [];

// Root of the maple server (one level up from this admin/ directory).
const SERVER_ROOT = path.join(__dirname, '..');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    title: 'Maple Server + Admin Panel',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

// ---- server lifecycle -------------------------------------------------

function isServerRunning() {
  return serverProcess !== null && !serverProcess.killed;
}

function spawnServerProcess() {
  serverLogBuffer = [];
  serverProcess = spawn('npm', ['run', 'start'], {
    cwd: SERVER_ROOT,
    shell: true,
    windowsHide: true,
  });

  serverProcess.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    serverLogBuffer.push(text);
    sendToRenderer('server:log', { stream: 'out', text });
  });
  serverProcess.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    serverLogBuffer.push(text);
    sendToRenderer('server:log', { stream: 'err', text });
  });
  serverProcess.on('error', (err) => {
    sendToRenderer('server:log', { stream: 'err', text: `[error] ${err.message}\n` });
  });
  serverProcess.on('exit', (code, signal) => {
    serverProcess = null;
    sendToRenderer('server:log', {
      stream: 'err',
      text: `\n[server exited] code=${code} signal=${signal}\n`,
    });
    sendToRenderer('server:status', { running: false, message: 'Server stopped.' });
  });
}

function startServer() {
  if (isServerRunning()) {
    sendToRenderer('server:status', { running: true, message: 'Server is already running.' });
    return;
  }
  sendToRenderer('server:status', { running: true, message: 'Starting server...' });
  spawnServerProcess();
}

function stopServer(callback) {
  if (!isServerRunning()) {
    sendToRenderer('server:status', { running: false, message: 'Server is not running.' });
    if (callback) callback();
    return;
  }
  const proc = serverProcess;
  serverProcess = null;
  sendToRenderer('server:status', { running: false, message: 'Stopping server...' });
  // `npm run start` spawns `node` as a child (via `&&` in a shell), so kill the
  // whole process tree on Windows.
  const killTree = () => {
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${proc.pid} /T /F`, () => {
        proc.kill('SIGKILL');
        if (callback) callback();
      });
    } else {
      proc.kill('SIGTERM');
      if (callback) callback();
    }
  };
  // Give the server a moment to flush DB saves before force-killing.
  killTree();
}

function restartServer() {
  const onStopped = () => {
    setTimeout(() => startServer(), 1000);
  };
  if (isServerRunning()) {
    stopServer(onStopped);
  } else {
    onStopped();
  }
}

function getServerLog() {
  return serverLogBuffer.join('');
}

// ---- IPC -----------------------------------------------------------------

ipcMain.handle('open-external', (_event, url) => {
  if (typeof url === 'string' && /^https?:\/\//.test(url)) {
    require('electron').shell.openExternal(url);
  }
});

ipcMain.handle('server:start', () => {
  startServer();
  return { running: isServerRunning() };
});

ipcMain.handle('server:stop', () => {
  stopServer();
  return { running: isServerRunning() };
});

ipcMain.handle('server:restart', () => {
  restartServer();
  return { running: isServerRunning() };
});

ipcMain.handle('server:status', () => {
  return { running: isServerRunning() };
});

ipcMain.handle('server:log', () => {
  return getServerLog();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// Stop the server when the app quits.
app.on('before-quit', () => {
  if (isServerRunning()) {
    const proc = serverProcess;
    serverProcess = null;
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${proc.pid} /T /F`, () => proc.kill('SIGKILL'));
    } else {
      proc.kill('SIGTERM');
    }
  }
});
