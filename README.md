# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Podcast Import Script: importFromListenNotes.js

This script fetches real podcast data from the Listen Notes API and imports it into your MongoDB database, accumulating keywords for each podcast.

### Prerequisites
- Node.js and npm installed
- MongoDB Atlas or local MongoDB instance
- Listen Notes API key ([get one here](https://www.listennotes.com/api/))

### Setup
1. **Install dependencies:**
   ```sh
   npm install dotenv mongoose node-fetch
   ```
2. **Environment variables:**
   - Create a `.env` file in your project root with:
     ```
     LISTEN_NOTES_API_KEY=your_actual_api_key_here
     MONGODB_URI=your_mongodb_connection_string
     ```
3. **Edit keywords (optional):**
   - In `importFromListenNotes.js`, edit the `KEYWORDS` array to fetch podcasts for your desired moods/topics.

### Usage
Run the script from your project root:
```sh
node importFromListenNotes.js
```

### What it does
- Fetches up to 50 podcasts per keyword (with pagination)
- Handles Listen Notes API rate limits and errors
- Accumulates all unique keywords for each podcast in the `keywords` array
- Upserts podcast data into MongoDB
- Prints a summary of the import process

---
