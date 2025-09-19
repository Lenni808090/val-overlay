const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  lockAgent: (agentId) => ipcRenderer.send('lock-agent', agentId),
  onStatusUpdate: (callback) => ipcRenderer.on('update-status', (event, status) => callback(status)),
  onLockSuccess: (callback) => ipcRenderer.on('lock-success', () => callback()),
  onCancelSuccess: (callback) => ipcRenderer.on('cancel-success', () => callback()),
  cancelLock:  () => ipcRenderer.send('lock-canceled'),
  lockMapAgent: () => ipcRenderer.send('lock-map-agent'),
});
