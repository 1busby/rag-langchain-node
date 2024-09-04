# RAG LangChain Node

This project implements a Retrieval-Augmented Generation (RAG) system using LangChain and Node.js. It allows users to query a knowledge base built from PDF documents using natural language questions.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20 or later)
- [Ollama](https://ollama.ai/)
- [Chroma](https://www.trychroma.com/)

## Setup

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/rag-langchain-node.git
   cd rag-langchain-node
   ```

2. Install the required Node.js packages:
   ```
   npm install
   ```

3. Install and start Ollama:
   - Follow the installation instructions for Ollama from their [official website](https://ollama.ai/).
   - Pull the llama3.1 model:
     ```
     ollama pull llama3.1
     ```
   - Start the Ollama server:
     ```
     ollama serve
     ```

4. Start Chroma:
   Open a new terminal and run:
   ```
   chroma run --path ./chroma_db
   ```

## Adding Documents

1. Create a `data` folder in the project root if it doesn't exist.
2. Add your PDF documents to the `data` folder.

## Updating the Knowledge Base

After adding new documents to the `data` folder, update the knowledge base by running:

```
npm run update-data
```

This script will process the PDFs, split them into chunks, and add them to the Chroma database.

## Running the Server

Start the Express server:

```
npm start
```

The server will start running at `http://localhost:3000`.

## Querying the RAG System

To query the RAG system, send a POST request to `http://localhost:3000/query` with a JSON body containing your question. For example:

```bash
curl -X POST http://localhost:3000/query \
     -H "Content-Type: application/json" \
     -d '{"query_text": "If I land on another players property in Monopoly, what happens?"}'
```

The system will return a response based on the information in your knowledge base.

## Project Structure

- `server.js`: The main Express server file.
- `queryData.js`: Contains the core RAG query logic.
- `embeddings.js`: Configures the embedding function for document processing.
- `updateData.js`: Script for processing PDFs and updating the knowledge base.

## Troubleshooting

- Ensure Ollama and Chroma are running before starting the server or updating data.
- If you encounter issues with Ollama, make sure the model is correctly installed and the server is running.
- For Chroma-related issues, check if the database path is correct and the Chroma server is accessible.

## Contributing

Contributions to this project are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the ISC License.