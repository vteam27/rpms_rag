import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChromaClient, DefaultEmbeddingFunction } from 'chromadb';
import { addFilesToCollection, addJsonToCollection } from './data_loader.js';
import {pprs} from './papers.js';
import {} from 'dotenv/config'

import { GoogleGenerativeAI } from '@google/generative-ai';
console.log(process.env.API_KEY);

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const app = express();
const port = 3000;
  
const client = new ChromaClient({
  path: process.env.CHROMA_URL||"http://localhost:8000"
});
const emb_fn = new DefaultEmbeddingFunction();

// Ingest documents: only run this once.
try {
  const collection = await getOrCreateCollection("Papers");
  await addJsonToCollection(pprs, collection)
  
  console.log("Json ingested successfully!");
} catch (error) {
  console.error("Error filling DB:", error.message);
}


app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

app.use(bodyParser.json());
app.use(cors());

app.get('/',(req, res)=>{
res.sendFile(__dirname+"/public/index.html");
});
app.post('/uploadFiles', async (req, res) => { 
  const { filePath } = req.body;
  const collection = await getOrCreateCollection("Papers");
  await addFilesToCollection(filePath, collection);
  res.send({ message: 'Files added to database successfully' });
});

app.post('/chat', async (req, res) => {
  console.log("query receiced!");
  const { query } = req.body;
  const collection = await getOrCreateCollection("Papers");
  const dbres = await queryCollection(collection, 5, [query]);
  let context=dbres.documents[0];
  context = JSON.stringify(context)
  const final_query = `You are an question answer assistant bot for giving information on a Research paper management system. If you don\'t know the answer, just say that you don\'t know. Don't output anything other than answering the asked question. Use markup language to format your answer. Context: \n\n ${context}. Always include metadata information on authors, publications, year, link to the papers, etc if relevant.  Question: ${query} `
  console.log(final_query);

  const result= await model.generateContent(final_query);
  const fres=result.response.text();
  console.log(fres);

  res.send({ ans: fres});
});


async function getOrCreateCollection(name) {
    const collection = await client.getOrCreateCollection({
      name,
      metadata: {
        description: "Research papers details",
        "hnsw:space": "l2" 
      },
      embeddingFunction: emb_fn,
    });
    return collection;
  }

async function queryCollection(collection, nResults, queryTexts) {
    const results = await collection.query({
      nResults,
      queryTexts,
    });
    return results;
  }
  
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


