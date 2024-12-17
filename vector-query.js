import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embedding.js';

const ATLAS_CONNECTION_STRING = "mongodb+srv://uddeepta:uddeepta@cluster0.eiezn.mongodb.net";
const client = new MongoClient(ATLAS_CONNECTION_STRING);

/**
 * Performs a vector search query on the MongoDB collection using an embedding.
 * @param {string} query - The search query string.
 * @param {number} limit - The number of results to return (default is 5).
 * @returns {Promise<Array>} - An array of search results.
 */
export async function vectorSearchQuery(query, limit = 5) {
    try {
        await client.connect();

        const database = client.db("capstone");
        const collection = database.collection("paper");

        // Generate the embedding for the search query
        const queryEmbedding = await getEmbedding(query);

        // Define the vector search pipeline
        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_index", // Replace with your vector index name
                    queryVector: queryEmbedding,
                    path: "embedding",
                    exact: true,
                    limit: limit
                }
            },
            {
                $project: {
                    _id: 1,
                    researcher: 1,
                    admin_id: 1,
                    title: 1,
                    link: 1,
                    authors: 1,
                    publicationDate: 1,
                    journal: 1,
                    volume: 1,
                    issue: 1,
                    pages: 1,
                    publisher: 1,
                    description: 1,
                    totalCitations: 1,
                    pdfLink: 1,
                    tags: 1,
                    lastFetch: 1,
                    previous: 1,
                    __v: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ];

        // Run the aggregation pipeline
        const result = await collection.aggregate(pipeline).toArray();
        console.log("DB result: \n : ", result);
        
        return result;
    } catch (err) {
        console.error("Error during vector search:", err.message);
        throw err;
    } finally {
        await client.close();
    }
}
