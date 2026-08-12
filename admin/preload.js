const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('adminApi', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // server lifecycle (spawns the maple server as a child process)
  serverStart: () => ipcRenderer.invoke('server:start'),
  serverStop: () => ipcRenderer.invoke('server:stop'),
  serverRestart: () => ipcRenderer.invoke('server:restart'),
  serverStatus: () => ipcRenderer.invoke('server:status'),
  serverLog: () => ipcRenderer.invoke('server:log'),

  // live server log / status events pushed from the main process
  onServerLog: (cb) => ipcRenderer.on('server:log', (_e, data) => cb(data)),
  onServerStatus: (cb) => ipcRenderer.on('server:status', (_e, data) => cb(data)),
});
