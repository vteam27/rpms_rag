import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embedding.js';

const ATLAS_CONNECTION_STRING = "mongodb+srv://admin-vaibhav:Test123@cluster0.jprmrgj.mongodb.net"
const client = new MongoClient(ATLAS_CONNECTION_STRING)

async function run() {
    try {
        await client.connect();

        const database = client.db("blogDB"); 
        const collection = database.collection("posts"); 

        // Generate embedding for the search query
        const queryEmbedding = await getEmbedding("prefix sum");

        // Define the sample vector search pipeline
        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_index",
                    queryVector: queryEmbedding,
                    path: "embedding",
                    exact: true,
                    limit: 5
                }
            },
            {
                $project: {
                    _id: 0,
                    post_content: 1,
                    score: {
                        $meta: "vectorSearchScore"
                    }
                }
            }
        ];

        // run pipeline
        const result = collection.aggregate(pipeline);

        // print results
        for await (const doc of result) {
            console.dir(JSON.stringify(doc));
        }
        } finally {
        await client.close();
    }
}
run().catch(console.dir);