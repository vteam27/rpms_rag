import { pipeline } from '@xenova/transformers';

// Function to generate embeddings for a given data source
export async function getEmbedding(data) {
    const embedder = await pipeline(
        'feature-extraction', 
        'Xenova/nomic-embed-text-v1');
    const results = await embedder(data, { pooling: 'mean', normalize: true });
    return Array.from(results.data);
}

// let contentForEmbedding="hi, how are you?";
// console.log("Content for embedding:", contentForEmbedding);
// const embedding = await getEmbedding(contentForEmbedding);
// console.log("Embedding result:", embedding);