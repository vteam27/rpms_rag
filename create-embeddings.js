import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embedding.js';

// Connect to your Atlas cluster
const ATLAS_CONNECTION_STRING = "mongodb+srv://uddeepta:uddeepta@cluster0.eiezn.mongodb.net";
const client = new MongoClient(ATLAS_CONNECTION_STRING);

async function run() {
    try {
        await client.connect();
        const db = client.db("capstone");
        const collection = db.collection("paper");

        const filter = { 
            "$or": [
                { "title": { "$nin": [null, ""] } },
                { "description": { "$nin": [null, ""] } },
                { "authors": { "$type": "array", "$not": { "$size": 0 } } }
            ]
        };

        const documents = await collection.find(filter).limit(50).toArray();
        console.log("Generating embeddings for documents...");
        
        let updatedDocCount = 0;
        let failedDocCount = 0;

        await Promise.all(documents.map(async (doc) => {
            try {
                // Concatenate relevant fields
                const title = doc.title || "";
                const description = doc.description || "";
                const firstAuthor = Array.isArray(doc.authors) && doc.authors.length > 0 ? doc.authors[0] : "";

                const contentForEmbedding = `${title} ${description} ${firstAuthor}`.trim();

                // Generate embedding only if the concatenated string is not empty
                if (contentForEmbedding) {
                    const embedding = await getEmbedding(contentForEmbedding);

                    // Update the document with a new embedding field
                    await collection.updateOne(
                        { "_id": doc._id },
                        { "$set": { "embedding": embedding } }
                    );

                    updatedDocCount += 1;
                }
            } catch (err) {
                // Log errors for the current document and continue
                console.error(`Failed to generate embedding for document ID ${doc._id}:`, err.message);
                failedDocCount += 1;
            }
        }));

        console.log("Count of documents successfully updated: " + updatedDocCount);
        console.log("Count of documents failed: " + failedDocCount);
            
    } catch (err) {
        console.error("Error:", err.stack);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
