import { existsSync } from 'fs';
import { copyFile, readFile, readdir, writeFile } from 'fs/promises';
import path from 'path';
import Store from 'electron-store';
import log from 'electron-log';
import { getMD5, indexingFileToFaiss } from './chat/faiss/indexing';
import { DataDocument, Question } from './types';

/**
 * get all available books
 */
export async function books(indexFolder: string): Promise<DataDocument[]> {
  if (!existsSync(indexFolder)) {
    return [];
  }
  // get all top level directories of indexFolder
  const bookIndexFolders = await readdir(indexFolder, {
    withFileTypes: true,
  });

  const folders = bookIndexFolders.filter((folder) => {
    return folder.isDirectory();
  });

  log.info(folders);

  const getDataDocument = async (folder: string): Promise<DataDocument> => {
    const configPath = path.join(folder, 'config.json');
    const config = await readFile(configPath, 'utf-8');
    return JSON.parse(config) as DataDocument;
  };

  const result = await Promise.all(
    folders.map((folder) => {
      return getDataDocument(path.join(indexFolder, folder.name));
    })
  );

  return result;
}

export async function getBookDetails(
  indexFolder: string,
  id: string
): Promise<DataDocument | null> {
  if (!existsSync(indexFolder)) {
    return null;
  }

  const bookFolder = path.join(indexFolder, id);
  const configPath = path.join(bookFolder, 'config.json');
  const config = await readFile(configPath, 'utf-8');
  return JSON.parse(config) as DataDocument;
}

/**
 * Create a new book at the given path
 * @param filePath local file path
 */
export async function createBookAtPath(
  openAIApiKey: string,
  filePath: string,
  indexFolder: string
): Promise<DataDocument> {
  const md5 = await getMD5(filePath);
  const bookFolder = path.join(indexFolder, md5);

  // let's create the pdf metadata info and save to the folder as well
  const fileName = path.basename(filePath);
  log.info(`Start indexing book ${fileName} at ${bookFolder}`);
  // now we have the book
  // we can method to indexing it
  // then save the indexed file to the user documents folder
  await indexingFileToFaiss(openAIApiKey, filePath, bookFolder);

  const dataDocument: DataDocument = {
    title: fileName,
    id: md5,
  };

  log.info(`start copying file from ${filePath} to ${bookFolder}`);

  log.info(`Copying file to ${bookFolder}`);

  // copy the file over the index folder as well
  await copyFile(filePath, path.join(bookFolder, fileName));

  console.log(`done copying file from ${filePath} to ${bookFolder}`);
  // save it to the index folder

  console.log(`start saving config file to ${bookFolder}`);
  await writeFile(
    path.join(bookFolder, 'config.json'),
    JSON.stringify(dataDocument),
    { encoding: 'utf-8' }
  );

  return dataDocument;
}

export async function pastQuestionsToBook(
  indexFolder: string
): Promise<Question[]> {
  const questionFile = path.join(indexFolder, 'questions.json');

  if (existsSync(questionFile)) {
    const questions = await readFile(questionFile, 'utf-8');
    return JSON.parse(questions) as Question[];
  }
  return [];
}

export interface ChainAnswerResult {
  text: string;
}

export async function getOpenAIAPIKey(): Promise<string | undefined> {
  const store = new Store();
  return store.get('openai.apiKey') as string | undefined;
}

export async function saveOpenAIAPIKey(key: string) {
  const store = new Store();
  store.set('openai.apiKey', key);
}
