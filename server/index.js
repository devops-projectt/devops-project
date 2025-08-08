import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './db.js';
import recommendationRoutes from './routes/recommendations.js';
import authRoutes from './routes/auth.js';
import podcastRoutes from './routes/podcasts.js';
import userRoutes from './routes/user.js';
import aiRoutes from './routes/ai.js';

console.log('authRoutes:', authRoutes);
console.log('recommendationRoutes:', recommendationRoutes);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

connectDB();

// ✅ חיבור ראוטים
app.use('/api/auth', authRoutes); // חדש! - התחברות/הרשמה
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes); // AI-powered recommendations

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend build
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Catch all handler: send back React's index.html file for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('MoodCast backend is up 🚀');
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
