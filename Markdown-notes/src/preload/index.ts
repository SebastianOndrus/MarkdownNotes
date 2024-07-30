import { GetNotes } from '@shared/types'
import { contextBridge, ipcRenderer } from 'electron'

if(!process.contextIsolated) {
  throw new Error('The preload script should be context isolated')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    getNotes: (...args: Parameters<GetNotes>) => ipcRenderer.invoke('getNotes', ...args)
    })
} catch (error) {
  console.error(error)
}