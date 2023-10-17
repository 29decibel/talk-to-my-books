/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';

import MenuBuilder from './menu';
import {
  resolveHtmlPath,
  selectDocumentFile,
  selectFolder,
  validateOpenAIKey,
} from './util';
import {
  books,
  createBookAtPath,
  getBookDetails,
  getOpenAIAPIKey,
  pastQuestionsToBook,
  saveOpenAIAPIKey,
} from './data';
import { questionToMultipleBooks, questionToMyBook } from './chat/faiss/query';
import { read } from 'fs';
import { readdir } from 'fs/promises';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('error', (err) => {
      log.error('error checking for updates');
      log.error(err);
    });

    // here we add all the events main cares about
    autoUpdater.on('update-downloaded', async () => {
      const response = await dialog.showMessageBox({
        title: 'Install Updates',
        message: 'Updates are ready to be installed.',
        defaultId: 0,
        cancelId: 1,
        buttons: ['Install and restart', 'Close'],
      });

      if (response.response === 0) {
        log.info('installing updates ...');
        setImmediate(() => autoUpdater.quitAndInstall());
      } else {
        log.info('skipping updates ...');
      }
    });
  }
}

// so that we can use it in the renderer process
log.initialize({ preload: true });

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 10, y: 10 },
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    const defaultIndexFolder = () => {
      return path.join(app.getPath('documents'), 'ttmb-index-store');
    };

    const getUserIndexFolder = () => {
      const store = new Store();
      return (store.get('user.index_folder') as string) || defaultIndexFolder();
    };

    const findEpubOrPDF = async (id: string) => {
      const indexStoreFolder = getUserIndexFolder();
      const booksFolder = path.join(indexStoreFolder, id);
      // find all the files in that folder booksFolder, then filter for pdf or epub
      const originalFiles = await readdir(booksFolder);
      const pdfOrEpubFiles = originalFiles.filter((file) => {
        return file.endsWith('.pdf') || file.endsWith('.epub');
      });
      return path.join(booksFolder, pdfOrEpubFiles[0]);
    };

    // here we add all the events main cares about
    ipcMain.handle('dialog:openFile', selectDocumentFile);
    ipcMain.handle('dialog:selectFolder', selectFolder);
    ipcMain.handle('getUserIndexFolder', getUserIndexFolder);
    ipcMain.handle('openPDF', async (event, ...args) => {
      const id = args[0];
      const filePath = await findEpubOrPDF(id);

      console.log('opening file', filePath);

      shell.openPath(filePath);
    });
    ipcMain.handle('setUserIndexFolder', async (event, ...args) => {
      const store = new Store();
      return store.set('user.index_folder', args[0]);
    });
    ipcMain.handle('books', async () => {
      const indexStoreFolder = getUserIndexFolder();

      try {
        return books(indexStoreFolder);
      } catch (error) {
        log.error(`error loading books`);
        log.error(error);
        return [];
      }
    });
    ipcMain.handle('bookDetails', async (event, ...args) => {
      const indexStoreFolder = getUserIndexFolder();
      const bookId = args[0];
      log.info(`Documents folder: ${indexStoreFolder}`);

      try {
        return getBookDetails(indexStoreFolder, bookId);
      } catch (error) {
        log.error(`error loading book ${bookId}`);
        log.error(error);
        return null;
      }
    });
    ipcMain.handle('createBook', async (event, ...args) => {
      const indexStoreFolder = getUserIndexFolder();
      log.info(`Documents folder: ${indexStoreFolder}`);

      try {
        const apiKey = await getOpenAIAPIKey();
        if (!apiKey) {
          throw new Error('Please set your OpenAI API key first');
        }
        const book = await createBookAtPath(apiKey, args[0], indexStoreFolder);
        return book;
      } catch (error) {
        log.error(`error creating book ${args[0]}`);
        log.error(error);
        return null;
      }
    });

    ipcMain.handle('questionToMyBook', async (event, ...args) => {
      const bookId = args[0];
      const question = args[1];
      const userIndexFolder = getUserIndexFolder();

      const apiKey = await getOpenAIAPIKey();
      if (apiKey) {
        log.info(`question to my book ${question}...`);

        try {
          const response = await questionToMyBook(
            apiKey,
            question,
            userIndexFolder,
            bookId
          );
          log.info('response', response);
          return response;
        } catch (err) {
          log.error('error saving question to index store');
          log.error(err);
          return null;
        }
      }

      dialog.showMessageBoxSync({
        type: 'error',
        message: `Please set your OpenAI API key first`,
      });

      return undefined;
    });

    ipcMain.handle('questionToMultipleBooks', async (event, ...args) => {
      const bookIds = args[0] as string[];
      const question = args[1];
      const userIndexFolder = getUserIndexFolder();

      const apiKey = await getOpenAIAPIKey();
      if (apiKey) {
        log.info(
          `question to multiple books ${bookIds.join(',')} ${question}...`
        );

        try {
          const response = await questionToMultipleBooks(
            apiKey,
            question,
            userIndexFolder,
            bookIds
          );
          log.info('response', response);
          return response;
        } catch (err) {
          log.error('error saving question to index store');
          log.error(err);
          return null;
        }
      }

      dialog.showMessageBoxSync({
        type: 'error',
        message: `Please set your OpenAI API key first`,
      });

      return undefined;
    });

    ipcMain.handle('pastQuestionsToBook', async (event, ...args) => {
      const bookId = args[0] as string | undefined;
      const userIndexFolder = getUserIndexFolder();
      const queryingFolder = bookId
        ? path.join(userIndexFolder, bookId)
        : userIndexFolder;

      return pastQuestionsToBook(queryingFolder);
    });

    ipcMain.handle('getOpenAIApiKey', async () => {
      return getOpenAIAPIKey();
    });

    ipcMain.handle('saveOpenAIApiKey', async (event, ...args) => {
      const key = args[0];
      return saveOpenAIAPIKey(key);
    });

    ipcMain.handle('validateOpenAIKey', async (event, ...args) => {
      const key = args[0];
      return validateOpenAIKey(key);
    });

    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
