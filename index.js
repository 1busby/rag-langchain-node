import express from 'express';
import { queryRag } from './queryData.js';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/query', async (req, res) => {
  try {
    const { query_text } = req.body;
    if (!query_text) {
      return res.status(400).json({ error: 'query_text is required' });
    }
    const response = await queryRag(query_text);
    res.json({ response });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});