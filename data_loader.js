import pdf from 'pdf-parse-fork';
import fs from 'fs';
import path from 'path';
import docx from 'docx-parser'


function chunkText(text) {
  const words = text.split(/\s+/);
  const chunkSize = 100
  ;
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }
  
  return chunks;
}

//PDF Parser
async function extractTextFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const pdfText=await pdf(dataBuffer);
  return pdfText.text;
}

//Docx Parser
async function extractTextFromDocx(filePath) {
  return new Promise((resolve, reject) => {
    docx.parseDocx(filePath, function(data) {
      if (data) {
        resolve(data);
      } else {
        reject(new Error("No data returned from parseDocx"));
      }
    });
  });
}


// Chunk and add text to collection
export async function addTextToCollection(text, filePath, collection) {
  console.log(`Ingesting File ${filePath}\n...`)
  const chunks=chunkText(text);
  const fileName = filePath.split('/').pop(); // Get PDF name from path
  const ids = chunks.map((_, index) => `${fileName}_chunk_${index + 1}`);
  const metadatas = chunks.map(() => ({ source: fileName }));

  const er1=await collection.add({
    ids,
    metadatas,
    documents: chunks,
  });

  console.log(er1);
}


//Master Parser
export async function addFilesToCollection(folderPath, collection) {
  const files = fs.readdirSync(folderPath);
  
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    if (path.extname(file).toLowerCase() === '.pdf') {
      const text= await extractTextFromPDF(filePath);
      await addTextToCollection(text, filePath, collection);
    }
    else if (path.extname(file).toLowerCase() === '.docx') {
      const text=await extractTextFromDocx(filePath);
      await addTextToCollection(text, filePath, collection);
    }
    else if (path.extname(file).toLowerCase() === '.txt') {
      const text = fs.readFileSync(filePath, 'utf8');
      await addTextToCollection(text, filePath, collection);
    }
    else
    continue;
  }
}

// Updated chunk and add text to collection for JSON data
export async function addJsonToCollection(jsonData, collection) {
  console.log(`Ingesting JSON data\n...`);
  
  for (const paper of jsonData) {
    // Combine all metadata into the chunk content
    const chunk = `
      Title: ${paper.title}\n
      Description: ${paper.description}\n
      Authors: ${paper.authors.join(", ")}\n
      Researcher Name: ${paper.researcher.name}\n
      Researcher ID: ${paper.researcher.researcher_id.$oid}\n
      Scholar ID: ${paper.researcher.scholar_id}\n
      Department: ${paper.researcher.department}\n
      Admin ID: ${paper.admin_id.$oid}\n
      Publication Date: ${paper.publicationDate}\n
      Journal: ${paper.journal}\n
      Volume: ${paper.volume}\n
      Issue: ${paper.issue}\n
      Pages: ${paper.pages}\n
      Publisher: ${paper.publisher}\n
      Total Citations: ${paper.totalCitations}\n
      Publication Link: ${paper.publicationLink}\n
      PDF Link: ${paper.pdfLink}\n
      Tags: ${paper.tags.join(", ")}\n
      Last Fetch Date: ${new Date(paper.lastFetch.$date).toLocaleString()}
    `;
    
    const id = paper._id.$oid;
    const metadata = { ...paper }; // Keeping all metadata for reference
    
    const er1 = await collection.add({
      ids: [id],
      metadatas: [metadata],
      documents: [chunk],
    });

    console.log(`Added paper: ${paper.title}`);
  }
  
  console.log("All JSON data ingested successfully!");
}

