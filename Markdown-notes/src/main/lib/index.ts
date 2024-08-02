import { appDirectoryName, fileEncoding, welcomeNoteFilename } from "@shared/constants"
import { NoteInfo } from "@shared/models"
import { CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote } from "@shared/types"
import { dialog } from "electron"
import { ensureDir, readdir, readFile, remove, stat, writeFile } from "fs-extra"
import { homedir } from "os"
import { isEmpty } from "lodash"
import path from "path"
import welcomeNoteFile from '../../../resources/welcomeNote.md?asset'

export const getRootDir = () => {
    return `${homedir()}\\${appDirectoryName}`
}

export const getNotes: GetNotes = async () => {
  const rootDir = getRootDir()

  await ensureDir(rootDir)

  const notesFileNames = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false
  })

  const notes = notesFileNames.filter((fileName) => fileName.endsWith('.md'))

  if(isEmpty(notes)) {
    console.info('No notes found. Displaying welcome note.')
    const content = await readFile(welcomeNoteFile, { encoding: fileEncoding })

    await writeFile(`${rootDir}/${welcomeNoteFilename}`, content, { encoding: fileEncoding })

    notes.push(welcomeNoteFilename)

  }
  
  return Promise.all(notes.map(getNoteInfoFromFileName))
}

export const getNoteInfoFromFileName = async (fileName : string): Promise<NoteInfo> =>  {
  const fileStats = await stat(`${getRootDir()}/${fileName}`)

  return {
    title: fileName.replace(/\.md$/, ''),
    lastEditTime: fileStats.mtimeMs
  }
}

export const readNote: ReadNote = async (filename) => {
  const rootDir = getRootDir()

  return readFile(`${rootDir}/${filename}.md`, { encoding: fileEncoding })
}

export const writeNote: WriteNote = async (filename, content) => {
  const rootDir = getRootDir()

  console.info(`Writing note ${filename}`) 

  return writeFile(`${rootDir}/${filename}.md`, content, { encoding: fileEncoding })
}

export const createNote: CreateNote = async () => {
  const rootDir = getRootDir()
  await ensureDir(rootDir)

  const {filePath, canceled} = await dialog.showSaveDialog({
    title: 'Create a new note',
    defaultPath: `${rootDir}/Untitled.md`,
    buttonLabel: 'Create',
    properties: ['showOverwriteConfirmation'],
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  })

  if(canceled || !filePath) {
    console.info('Note creation canceled')
    return false
  }

  const {name: filename, dir: parentDir} = path.parse(filePath)

  if(parentDir !== rootDir) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Error creating note',
      message: 'Notes must be created in the notes directory',
      detail: `Please create notes in the directory ${rootDir}`
    })

    return false
  }

  console.info(`Creating note ${filename}`)
  await writeFile(filePath, '')

  return filename

}

export const deleteNote: DeleteNote = async (filename) => {
  const rootDir = getRootDir()

  const {response} = await dialog.showMessageBox({
    type: 'warning',
    title: 'Delete note',
    message: `Are you sure you want to delete the note ${filename}?`,
    buttons: ['Yes', 'Cancel'], // 0 is Yes, 1 is Cancel
    defaultId: 1,
    cancelId: 1
  })

  if(response === 1) {
    console.info('Note deletion canceled')
    return false
  }

  console.info(`Deleting note ${filename}`)
  await remove(`${rootDir}\\${filename}.md`)
  return true

}
