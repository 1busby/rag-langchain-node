import fs from 'fs-extra';
import path from 'path';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChromaClient } from 'chromadb';
import { getEmbeddingFunction } from './embeddings.js';

const CHROMA_PATH = "http://localhost:8000";
const DATA_PATH = "data";
const COLLECTION_NAME = "my_collection";

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--reset")) {
    console.log("✨ Clearing Database");
    await clearDatabase();
  }

  const documents = await loadDocuments();
  const chunks = await splitDocuments(documents);
  await addToChroma(chunks);
}

async function loadDocuments() {
  const files = await fs.readdir(DATA_PATH);
  const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
  
  let documents = [];
  for (const file of pdfFiles) {
    const loader = new PDFLoader(path.join(DATA_PATH, file));
    const docs = await loader.load();
    documents = documents.concat(docs);
  }
  return documents;
}

async function splitDocuments(documents) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 80,
  });
  return await textSplitter.splitDocuments(documents);
}

async function addToChroma(chunks) {
  const client = new ChromaClient({ path: CHROMA_PATH });
  const embeddingFunction = await getEmbeddingFunction();

  let collection;
  try {
    collection = await client.getCollection({ name: COLLECTION_NAME, embeddingFunction });
  } catch (e) {
    collection = await client.createCollection({ name: COLLECTION_NAME, embeddingFunction });
  }
  
  console.log('LOOK 3');
  const chunksWithIds = calculateChunkIds(chunks);

  console.log(`Adding ${chunksWithIds.length} chunks to the database...`);
  
  // Add chunks in batches to avoid overwhelming the database
  const batchSize = 100;
  let chunksAdded = 0;
  for (let i = 0; i < chunksWithIds.length; i += batchSize) {
    console.log('LOOK i', i);
    console.log('LOOK chunksWithIds.length', chunksWithIds.length);
    if (chunksAdded >= chunksWithIds.length) {
      break;
    }
    const batch = chunksWithIds.slice(i, i + batchSize);
    
    chunksAdded += batchSize;
    let newChunks = {
      ids: [],
      metadatas: [],
      documents: [],
    };

    batch.forEach(chunk => {
      newChunks.ids.push(chunk.metadata.id);
      // newChunks.embeddings.push(chunk.pageContent);
      newChunks.metadatas.push(chunk.metadata);
      newChunks.documents.push(chunk.pageContent);
    });

    console.log(newChunks.ids.length);
    // console.log(newChunks.embeddings.length);
    console.log(newChunks.metadatas.length);
    console.log(newChunks.documents.length);


    await collection.add(newChunks);
    console.log(`Added batch ${i / batchSize + 1} of ${Math.ceil(chunksWithIds.length / batchSize)}`);
  }

  console.log("✅ All documents added to the database");
}

function calculateChunkIds(chunks) {
  let lastPageId = null;
  let currentChunkIndex = 0;

  return chunks.map(chunk => {
    const source = chunk.metadata.source;
    const page = chunk.metadata.page;
    const currentPageId = `${source}:${page}`;

    if (currentPageId === lastPageId) {
      currentChunkIndex += 1;
    } else {
      currentChunkIndex = 0;
    }

    const chunkId = `${currentPageId}:${currentChunkIndex}`;
    lastPageId = currentPageId;

    chunk.metadata.id = chunkId;
    return chunk;
  });
}

async function clearDatabase() {
  await fs.remove(CHROMA_PATH);
}

main().catch(console.error);