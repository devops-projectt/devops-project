// routes/recommendations.js
import express from 'express';
import Recommendation from '../models/Recommendation.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const all = await Recommendation.find();
    const grouped = {};

    all.forEach(({ mood, name, url }) => {
      if (!grouped[mood]) grouped[mood] = [];
      grouped[mood].push({ name, url });
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from DB' });
  }
});

export default router;
