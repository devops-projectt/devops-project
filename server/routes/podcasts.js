import express from 'express';
import Podcast from '../models/Podcast.js';

const router = express.Router();

// GET /api/podcasts?keyword=happy
router.get('/', async (req, res) => {
  const { keyword } = req.query;
  try {
    // Find podcasts that have the keyword in their keywords array
    const podcasts = await Podcast.find(
      keyword ? { keywords: keyword } : {}
    ).limit(50);
    res.json(podcasts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
});

// Local podcast search by title or description
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.json([]);
  }
  try {
    const regex = new RegExp(q, 'i'); // case-insensitive
    const podcasts = await Podcast.find({
      $or: [
        { title: regex },
        { description: regex }
      ]
    }).limit(50);
    res.json(podcasts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search podcasts' });
  }
});

export default router;