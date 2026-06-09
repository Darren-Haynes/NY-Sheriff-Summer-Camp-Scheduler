import { contextBridge, ipcRenderer } from 'electron';

type IpcStringCallback = (data: string) => void;

const preload = {
  send_text: (message: string) => ipcRenderer.invoke('submit-text', message),
  copy_schedule: (scheduleText: string) => ipcRenderer.invoke('copy-schedule', scheduleText),
  export_excel: (report: any, waterActs: string[], land9amActs: string[], land10amActs: string[]) =>
    ipcRenderer.invoke('export-excel', report, waterActs, land9amActs, land10amActs),
  file_dialog: () => ipcRenderer.invoke('open-file-dialog'),
  // send_error: (errorData: []) => ipcRenderer.on('error-list', errorData),
  send_error: (callback: IpcStringCallback) =>
    ipcRenderer.on('error-list', (_event, value) => callback(value)),
  send_result: (callback: IpcStringCallback) =>
    ipcRenderer.on('result-list', (_event, value) => callback(value)),
  send_clipboard: (callback: IpcStringCallback) =>
    ipcRenderer.on('clipboard-content', (_event, value) => callback(value)),
};

contextBridge.exposeInMainWorld('textAPI', preload);

export type TPreload = typeof preload;
