import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  selectFile: () => ipcRenderer.invoke('select-file'),
  startSpringBoot: () => ipcRenderer.invoke('start-spring-boot'),
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      selectFile: () => Promise<string | null>;
      startSpringBoot: () => Promise<void>;
      removeAllListeners: (channel: string) => void;
    };
  }
}
