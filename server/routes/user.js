import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// JWT auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader); // Debug log
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.log('JWT error:', err.message); // Debug log
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Add to favorites
router.post('/favorites', authMiddleware, async (req, res) => {
  const { podcastId } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user.favorites.includes(podcastId)) {
    user.favorites.push(podcastId);
    await user.save();
  }
  res.json(user.favorites);
});

// Remove from favorites
router.delete('/favorites/:podcastId', authMiddleware, async (req, res) => {
  const { podcastId } = req.params;
  const user = await User.findById(req.user.userId);
  user.favorites = user.favorites.filter(id => id !== podcastId);
  await user.save();
  res.json(user.favorites);
});

// Get favorites
router.get('/favorites', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user.favorites);
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ username: user.username, avatar: user.avatar, bio: user.bio });
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { avatar, bio } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { avatar, bio },
    { new: true }
  );
  res.json({ username: user.username, avatar: user.avatar, bio: user.bio });
});

export default router;