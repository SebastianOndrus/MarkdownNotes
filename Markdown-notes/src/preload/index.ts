import { contextBridge } from 'electron'

if(!process.contextIsolated) {
  throw new Error('The preload script should be context isolated')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language
    })
} catch (error) {
  console.error(error)
}