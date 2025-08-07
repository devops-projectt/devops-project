import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // בדוק אם המשתמש כבר קיים
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    // הצפן סיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // צור טוקן
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
