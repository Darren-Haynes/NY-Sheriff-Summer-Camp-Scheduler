import { contextBridge, ipcRenderer } from 'electron';

const preload = {
  send_text: (message: string) => ipcRenderer.invoke('submit-text', message),
  file_dialog: () => ipcRenderer.invoke('open-file-dialog'),
  // send_error: (errorData: []) => ipcRenderer.on('error-list', errorData),
  send_error: callback => ipcRenderer.on('error-list', (_event, value) => callback(value)),
};

contextBridge.exposeInMainWorld('textAPI', preload);

export type TPreload = typeof preload;
