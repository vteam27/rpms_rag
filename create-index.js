import { MongoClient } from 'mongodb';

const ATLAS_CONNECTION_STRING = "mongodb+srv://admin-vaibhav:Test123@cluster0.jprmrgj.mongodb.net"
const client = new MongoClient(ATLAS_CONNECTION_STRING);

async function run() {
  try {
    const database = client.db("blogDB");
    const collection = database.collection("posts");
   
    // Define your Atlas Vector Search index
    const index = {
        name: "vector_index",
        type: "vectorSearch",
        definition: {
          "fields": [
            {
              "type": "vector",
              "path": "embedding",
              "similarity": "dotProduct",
              "numDimensions": 768
            }
          ]
        }
    }

    // Call the method to create the index
    const result = await collection.createSearchIndex(index);
    console.log(result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
