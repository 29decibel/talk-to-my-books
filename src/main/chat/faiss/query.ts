/* eslint-disable @typescript-eslint/no-explicit-any */

import { readFile, writeFile } from 'fs/promises';
import { ChainValues } from 'langchain/schema';
import { existsSync } from 'fs';
import path from 'path';

import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { FaissStore } from 'langchain/vectorstores/faiss';
import log from 'electron-log';
import { Question } from 'main/types';
import makeChain from '../makechain';

export async function exampleQuery() {
  // Save the vector store to a directory
  const directory = 'index_stores';

  // Load the vector store from the same directory
  const store = await FaissStore.load(directory, new OpenAIEmbeddings());

  // Search the index without any filters
  const results = await store.similaritySearch('hello world', 1);
  console.log(results);
  /*
  [ Document { pageContent: 'hello world', metadata: { foo: 'bar' } } ]
  */

  // Search the index with a filter, in this case, only return results where
  // the "foo" metadata key is equal to "baz", see the Weaviate docs for more
  // https://weaviate.io/developers/weaviate/api/graphql/filters
  const results2 = await store.similaritySearch('hello world', 1, {
    where: {
      operator: 'Equal',
      path: ['foo'],
      valueText: 'baz',
    },
  });
  console.log(results2);
  /*
  [ Document { pageContent: 'hi there', metadata: { foo: 'baz' } } ]
  */
}

async function saveQuestionToIndexStore(
  indexFolder: string,
  questionTitle: string,
  response: ChainValues
) {
  try {
    const questionFile = path.join(indexFolder, 'questions.json');
    if (existsSync(questionFile)) {
      const existingQuestions = await readFile(questionFile, 'utf-8');
      const existingQuestionsJson = JSON.parse(existingQuestions) as Question[];
      existingQuestionsJson.unshift({
        question: questionTitle,
        response: response as Question['response'],
      });
      // save it back
      await writeFile(questionFile, JSON.stringify(existingQuestionsJson));
    } else {
      // create the file
      await writeFile(
        questionFile,
        JSON.stringify([
          {
            question: questionTitle,
            response,
          },
        ])
      );
    }
  } catch {
    console.log('error saving question to index store');
  }
}

export async function questionToMyBook(
  openAIApiKey: string,
  question: string,
  storeFolder: string,
  bookId: string,
  temperature: number = 0.3,
  history: string[] = []
) {
  log.info(`question to my book ${question} with history ${history}...`);
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  const indexFolder = path.join(storeFolder, bookId);

  // Load the vector store from the same directory
  log.info(`loading faiss store in ${indexFolder}...`);
  const store = await FaissStore.load(
    indexFolder,
    new OpenAIEmbeddings({
      openAIApiKey,
    })
  );

  const chain = makeChain(openAIApiKey, store, temperature);

  log.info('calling chain...');
  const response = await chain.call({
    question: sanitizedQuestion,
    chat_history: history.join('\n'),
  });
  log.info('response', response);

  log.info('saving question to index store...');

  await saveQuestionToIndexStore(indexFolder, sanitizedQuestion, response);

  // let's save the response along with question to the folder

  return response;
}

export type QuestionToMyBookResult = ReturnType<typeof questionToMyBook>;

async function saveSearchQuestionToStore(
  storeFolder: string,
  questionTitle: string,
  bookIds: string[],
  response: ChainValues
) {
  try {
    const questionFile = path.join(storeFolder, 'questions.json');
    if (existsSync(questionFile)) {
      const existingQuestions = await readFile(questionFile, 'utf-8');
      const existingQuestionsJson = JSON.parse(existingQuestions) as Question[];
      existingQuestionsJson.unshift({
        question: questionTitle,
        response: response as Question['response'],
        bookIds,
      });
      // save it back
      await writeFile(questionFile, JSON.stringify(existingQuestionsJson));
    } else {
      // create the file
      await writeFile(
        questionFile,
        JSON.stringify([
          {
            question: questionTitle,
            response,
            bookIds,
          },
        ])
      );
    }
  } catch {
    console.log('error saving question to index store');
  }
}

export async function questionToMultipleBooks(
  openAIApiKey: string,
  question: string,
  storeFolder: string,
  bookIds: string[],
  temperature: number = 0.3,
  history: string[] = []
) {
  log.info(`question to my book ${question} with history ${history}...`);
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  // folders stored all the indexing data
  const indexFolders = bookIds.map((bookId) => path.join(storeFolder, bookId));
  // load all the stores there
  const allVectorStores = await Promise.all(
    indexFolders.map((indexFolder) =>
      FaissStore.load(
        indexFolder,
        new OpenAIEmbeddings({
          openAIApiKey,
        })
      )
    )
  );
  // combine all of them into one store
  const targetStore = allVectorStores[0];
  // loop the rest and merge them into the first one
  for (let i = 1; i < allVectorStores.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await targetStore.mergeFrom(allVectorStores[i]);
  }

  const chain = makeChain(openAIApiKey, targetStore, temperature);

  log.info('calling chain...');
  const response = await chain.call({
    question: sanitizedQuestion,
    chat_history: history.join('\n'),
  });
  log.info('response', response);

  log.info('saving question to index store...');

  await saveSearchQuestionToStore(
    storeFolder,
    sanitizedQuestion,
    bookIds,
    response
  );

  // await saveQuestionToIndexStore(indexFolder, sanitizedQuestion, response);

  // let's save the response along with question to the folder

  return response;
}
