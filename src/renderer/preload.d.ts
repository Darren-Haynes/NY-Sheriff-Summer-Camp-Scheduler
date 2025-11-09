import { TPreload } from "../main/preload"

declare global {
    interface Window {
        textAPI: TPreload
    }
}
