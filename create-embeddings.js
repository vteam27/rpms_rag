import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embedding.js';

// Connect to your Atlas cluster
const ATLAS_CONNECTION_STRING = "mongodb+srv://admin-vaibhav:Test123@cluster0.jprmrgj.mongodb.net"
const client = new MongoClient(ATLAS_CONNECTION_STRING);

async function run() {
    try {
        await client.connect();
        const db = client.db("blogDB");
        const collection = db.collection("posts");

        const filter = { "post_content": { "$nin": [ null, ""] } };

        const documents = await collection.find(filter).limit(50).toArray();
        console.log(documents);
        let updatedDocCount = 0;
        console.log("Generating embeddings for documents...");
        await Promise.all(documents.map(async doc => {
           const embedding = await getEmbedding(doc.post_content);

           // Update the document with a new embedding field
           await collection.updateOne({ "_id": doc._id },
               {
                   "$set": {
                       "embedding": embedding
                   }
               }
           );
           updatedDocCount += 1;
       }));
       console.log("Count of documents updated: " + updatedDocCount);
            
    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}
run().catch(console.dir);
