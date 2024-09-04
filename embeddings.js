import { BedrockEmbeddings } from "langchain/embeddings/bedrock";
// import { OllamaEmbeddings } from "langchain/embeddings/ollama";

async function getEmbeddingFunction() {
  const embeddings = new BedrockEmbeddings({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: "us-east-1",
  });
  
  // Uncomment the following line if you want to use Ollama embeddings instead
  // const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

  return embeddings;
}

export { getEmbeddingFunction };