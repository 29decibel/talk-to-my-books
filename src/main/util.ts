/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { dialog } from 'electron';
import { OpenAI } from 'openai';

export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  const openai = new OpenAI({
    apiKey,
  });

  try {
    const result = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: 'test',
      max_tokens: 1,
    });
    console.log(result);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export async function selectDocumentFile() {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Documents', extensions: ['pdf', 'epub'] }],
  });

  console.log(result.filePaths);
  return result.filePaths;
}

export async function selectFolder() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  console.log(result.filePaths);
  return result.filePaths[0];
}
