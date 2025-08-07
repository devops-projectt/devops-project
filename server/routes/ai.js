import express from 'express';
import aiRecommendationService from '../services/aiRecommendation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get personalized AI recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const { mood } = req.query;
    const userId = req.user.userId;
    
    const recommendations = await aiRecommendationService.getPersonalizedRecommendations(userId, mood);
    
    res.json({
      success: true,
      recommendations,
      message: 'AI-powered recommendations generated successfully'
    });
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI recommendations'
    });
  }
});

// Generate/update user AI profile
router.post('/profile/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const profile = await aiRecommendationService.generateUserProfile(userId);
    
    res.json({
      success: true,
      profile,
      message: 'AI profile generated successfully'
    });
  } catch (error) {
    console.error('Error generating AI profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI profile'
    });
  }
});

// Get user AI profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // This will generate profile if it doesn't exist
    const profile = await aiRecommendationService.generateUserProfile(userId);
    
    res.json({
      success: true,
      profile,
      message: 'AI profile retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting AI profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI profile'
    });
  }
});

// Track listening activity
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { podcastData, mood } = req.body;
    
    if (!podcastData) {
      return res.status(400).json({
        success: false,
        message: 'Podcast data is required'
      });
    }
    
    const trackingEntry = await aiRecommendationService.trackListeningActivity(
      userId, 
      podcastData, 
      mood
    );
    
    res.json({
      success: true,
      trackingEntry,
      message: 'Listening activity tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking listening activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track listening activity'
    });
  }
});

// Get listening insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Generate profile to get latest insights
    const profile = await aiRecommendationService.generateUserProfile(userId);
    
    // Calculate additional insights
    const insights = {
      totalListeningTime: 0,
      favoriteMood: null,
      listeningStreak: 0,
      topGenres: [],
      personalityTraits: profile.personalityTraits,
      contentPreferences: profile.contentPreferences
    };
    
    // Find favorite mood
    const moodCounts = Object.entries(profile.moodPatterns);
    const favoriteMood = moodCounts.reduce((max, [mood, data]) => 
      data.count > max.count ? { mood, count: data.count } : max, 
      { mood: null, count: 0 }
    );
    
    insights.favoriteMood = favoriteMood.mood;
    
    res.json({
      success: true,
      insights,
      message: 'Listening insights retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get listening insights'
    });
  }
});

export default router; 