// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { QuestionToMyBookResult } from './chat/faiss/query';
import { DataDocument } from './types';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
export type ElectronHandler = typeof electronHandler;

// for file selection
// IMPORTANT!!
// here we can only have string, in this case, the dialog:openFile message
const fileHandler = {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  openPDF: (bookId: string) => ipcRenderer.invoke('openPDF', bookId),
};
contextBridge.exposeInMainWorld('fileHandler', fileHandler);
export type FileHandler = typeof fileHandler;

// here is the books api

const booksHandler = {
  allBooks: (): Promise<DataDocument[]> => ipcRenderer.invoke('books'),
  getBookDetails: (bookId: string): Promise<DataDocument | null> =>
    ipcRenderer.invoke('bookDetails', bookId),
  createBook: (filePath: string): Promise<DataDocument> =>
    ipcRenderer.invoke('createBook', filePath),
  pastQuestionsToBook: (bookId?: string) =>
    ipcRenderer.invoke('pastQuestionsToBook', bookId),
  questionToMyBook: (
    bookId: string,
    questionTitle: string
  ): QuestionToMyBookResult =>
    ipcRenderer.invoke('questionToMyBook', bookId, questionTitle),
  questionToMultipleBooks: (
    bookIds: string[],
    questionTitle: string
  ): QuestionToMyBookResult =>
    ipcRenderer.invoke('questionToMultipleBooks', bookIds, questionTitle),
  getOpenAIApiKey: () => ipcRenderer.invoke('getOpenAIApiKey'),
  saveOpenAIApiKey: (key: string) =>
    ipcRenderer.invoke('saveOpenAIApiKey', key),
  getUserIndexFolder: () => ipcRenderer.invoke('getUserIndexFolder'),
  setUserIndexFolder: (folder: string) =>
    ipcRenderer.invoke('setUserIndexFolder', folder),
  validateOpenAIKey: (apiKey: string) =>
    ipcRenderer.invoke('validateOpenAIKey', apiKey),
};

contextBridge.exposeInMainWorld('books', booksHandler);
export type BooksHandler = typeof booksHandler;
