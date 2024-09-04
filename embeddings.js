import { BedrockEmbeddings } from "@langchain/aws";
// import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

async function getEmbeddingFunction() {
  const embeddings = new ExtendedBedrockEmbeddings({
    // credentials: {
    //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // },
    credentials: defaultProvider(),
    region: "us-east-1",
    maxRetries: 3,
  });
  
  // Uncomment the following line if you want to use Ollama embeddings instead
  // const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

  return embeddings;
}

class ExtendedBedrockEmbeddings extends BedrockEmbeddings {
  constructor(fields) {
      super(fields); // Call the parent class constructor
  }

  // Add the generate method
  async generate(documents) {
      try {
          // Call the embedDocuments method from the parent class
          const embeddings = await this.embedDocuments(documents);
          return embeddings;
      } catch (error) {
          console.error('Error generating embeddings:', error);
          throw error; // Rethrow the error after logging it
      }
  }
}


export { getEmbeddingFunction };