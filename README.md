## Steps to Execute RAG:

1. **Clone the repository and install dependencies**  
   ```bash
   git clone https://github.com/vteam27/rpms_rag.git
   npm install
   ```

2. **Add your Gemini API key**  
   Add your Gemini API key to the `.env` file:
   ```
   API_KEY=<your-gemini-api-key>
   ```

3. **Fetch ChromaDB**  
   Pull and run ChromaDB using Docker:
   ```bash
   docker pull chromadb/chroma
   docker run -p 8000:8000 chromadb/chroma
   ```

4. **Run the application**  
   Start the Node.js app:
   ```bash
   node app.js
   ```
   
5. **Query the database using frontend:**
   ```
   http://localhost:3000/
   ```

**Note:**  
- Your data is in the `papers.js` file in JSON format.  
- The `data-loader.js` script handles populating the database.
