import { ChromaClient } from 'chromadb';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Ollama } from "@langchain/ollama";
import { getEmbeddingFunction } from './embeddings.js';

const CHROMA_PATH = "http://localhost:8000";
const COLLECTION_NAME = "my_collection";

const PROMPT_TEMPLATE = `
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
`;

export async function queryRag(queryText) {
  // Prepare the DB.
  const embeddingFunction = await getEmbeddingFunction();

  const client = new ChromaClient({ path: CHROMA_PATH });
  const collection = await client.getCollection({ name: COLLECTION_NAME, embeddingFunction });

  // Search the DB.
  const results = await collection.query({
        nResults: 10, // n_results
        queryTexts: [queryText], // query_text
    });


  const contextText = results.documents[0].map((text) => text).join("\n\n---\n\n");
  const promptTemplate = ChatPromptTemplate.fromTemplate(PROMPT_TEMPLATE);
  const prompt = await promptTemplate.format({ context: contextText, question: queryText });

  const model = new Ollama({ model: "llama3.1" });
  const responseText = await model.invoke(prompt);

  const sources = results.metadatas[0].map(({ id, source }) => id || null);
  const formattedResponse = `Response: ${responseText}\nSources: ${JSON.stringify(sources)}`;
  console.log(formattedResponse);

  return responseText;
}