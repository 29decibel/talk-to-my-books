import { FaissStore } from 'langchain/vectorstores/faiss';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { BaseDocumentLoader } from 'langchain/document_loaders/base';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { EPubLoader } from 'langchain/document_loaders/fs/epub';

import * as crypto from 'crypto';
import * as fs from 'fs';

import log from 'electron-log';
import { VectorStore } from 'langchain/vectorstores/base';

// loading into https://js.langchain.com/docs/modules/data_connection/vectorstores/integrations/weaviate
export async function indexingToFaissUsingLoader(
  openAIApiKey: string,
  loader: BaseDocumentLoader,
  directory: string,
  namespace?: string
) {
  log.info(`Start indexing given file  on namespace ${namespace}...`);
  const docs = await loader.load();

  // here we need to split the docs into chunks of 1000
  // and then index them
  // Create vector store and index the docs
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  log.info('Splitting documents...');
  const documentsRecords = await splitter.splitDocuments(docs);

  log.info(`Indexing documents. Total: ${documentsRecords.length}...`);

  log.info('Start indexing given file ...');

  // Create a vector store through any method, here from texts as an example
  const vectorStore = await FaissStore.fromDocuments(
    documentsRecords,
    new OpenAIEmbeddings({
      openAIApiKey,
    })
  );

  // Save the vector store to a directory
  // const directory = 'index_stores';

  await vectorStore.save(directory);

  // Load the vector store from the same directory
  const loadedVectorStore = await FaissStore.load(
    directory,
    new OpenAIEmbeddings({
      openAIApiKey,
    })
  );

  // vectorStore and loadedVectorStore are identical
  //   const result = await loadedVectorStore.similaritySearch("hello world", 1);
  //   console.log(result);

  log.info('Done indexing...');
  return loadedVectorStore;
}

export function getMD5(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data: Buffer) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
}

export async function indexingFileToFaiss(
  openAIApiKey: string,
  filePath: string,
  folder: string,
  namespace?: string
): Promise<VectorStore> {
  if (filePath.endsWith('.pdf')) {
    const loader = new PDFLoader(filePath);
    const vecStore = await indexingToFaissUsingLoader(
      openAIApiKey,
      loader,
      folder,
      namespace
    );
    return vecStore;
  }

  if (filePath.endsWith('.epub')) {
    const loader = new EPubLoader(filePath);

    const vecStore = await indexingToFaissUsingLoader(
      openAIApiKey,
      loader,
      folder,
      namespace
    );
    return vecStore;
  }
  throw new Error('File type not supported');
}
