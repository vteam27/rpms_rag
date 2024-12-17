import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';  
import { fileURLToPath } from 'url';
import { vectorSearchQuery } from './vector-query.js';
import {} from 'dotenv/config'

import { GoogleGenerativeAI } from '@google/generative-ai';
console.log(process.env.API_KEY);

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const app = express();
const port = 3000;

app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

app.use(bodyParser.json());
app.use(cors());

app.get('/',(req, res)=>{
res.sendFile(__dirname+"/public/index.html");
});

let chatHistory = []; 

app.post('/chat', async (req, res) => {
  console.log("query receiced!");
  const { query } = req.body;
  chatHistory.push(`User: ${query}`);
  let context=await vectorSearchQuery(query, 3);
  context = JSON.stringify(context);
  const history = chatHistory.join("\n");
  const final_query = `You are an question answer assistant chatbot for giving information on a Research paper management system. 
  If you don\'t know the answer, just say that you don\'t know. Don't output anything other than answering the asked question.
  Use markup language to format your answer. 
  Chat History: ${history} 
  Context: \n\n ${context}. 
  Always include metadata information on authors, publications, year, link to the papers, etc if relevant.  
  
  Question: ${query} `
  console.log(final_query);

  const result= await model.generateContent(final_query);
  const fres=result.response.text();
  console.log(fres);
  chatHistory.push(`Bot: ${fres}`);


  res.send({ ans: fres});
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


