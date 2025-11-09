import { contextBridge, ipcRenderer } from "electron"

const preload = {
    send_text: (message: string) => ipcRenderer.invoke('submit-text', message)
}

contextBridge.exposeInMainWorld('textAPI', preload)

export type TPreload = typeof preload