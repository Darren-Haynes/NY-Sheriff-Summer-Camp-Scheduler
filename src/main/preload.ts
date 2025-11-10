import { contextBridge, ipcRenderer } from "electron"

const preload = {
    send_text: (message: string) => ipcRenderer.invoke('submit-text', message),
    file_dialog: () => ipcRenderer.invoke('open-file-dialog')
}

contextBridge.exposeInMainWorld('textAPI', preload)

export type TPreload = typeof preload