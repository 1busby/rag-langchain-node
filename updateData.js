import fs from 'fs-extra';
import path from 'path';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { getEmbeddingFunction } from './embeddings.js';

const CHROMA_PATH = "chroma";
const DATA_PATH = "data";

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
  const embeddings = await getEmbeddingFunction();
  const db = await Chroma.fromExisting(embeddings, { persistDirectory: CHROMA_PATH });

  const chunksWithIds = calculateChunkIds(chunks);

  const existingItems = await db.get();
  const existingIds = new Set(existingItems.ids);
  console.log(`Number of existing documents in DB: ${existingIds.size}`);

  const newChunks = chunksWithIds.filter(chunk => !existingIds.has(chunk.metadata.id));

  if (newChunks.length) {
    console.log(`👉 Adding new documents: ${newChunks.length}`);
    const newChunkIds = newChunks.map(chunk => chunk.metadata.id);
    await db.addDocuments(newChunks, { ids: newChunkIds });
    await db.persist();
  } else {
    console.log("✅ No new documents to add");
  }
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