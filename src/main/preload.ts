import { contextBridge, ipcRenderer } from 'electron';

const preload = {
  send_text: (message: string) => ipcRenderer.invoke('submit-text', message),
  copy_schedule: (scheduleText: string) => ipcRenderer.invoke('copy-schedule', scheduleText),
  export_excel: (scheduleText: string) => ipcRenderer.invoke('export-excel', scheduleText),
  file_dialog: () => ipcRenderer.invoke('open-file-dialog'),
  // send_error: (errorData: []) => ipcRenderer.on('error-list', errorData),
  send_error: callback => ipcRenderer.on('error-list', (_event, value) => callback(value)),
  send_result: callback => ipcRenderer.on('result-list', (_event, value) => callback(value)),
  send_clipboard: callback =>
    ipcRenderer.on('clipboard-content', (_event, value) => callback(value)),
};

contextBridge.exposeInMainWorld('textAPI', preload);

export type TPreload = typeof preload;
