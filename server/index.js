import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import recommendationRoutes from './routes/recommendations.js';
import authRoutes from './routes/auth.js';
import podcastRoutes from './routes/podcasts.js';
import userRoutes from './routes/user.js';

console.log('authRoutes:', authRoutes);
console.log('recommendationRoutes:', recommendationRoutes);

dotenv.config();

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

app.get('/', (req, res) => {
  res.send('MoodCast backend is up 🚀');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
