import User from '../models/User.js';
import Podcast from '../models/Podcast.js';

class AIRecommendationService {
  // Analyze user's listening patterns and generate AI profile
  async generateUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const history = user.listeningHistory;
      if (history.length === 0) {
        return this.generateDefaultProfile();
      }

      // Analyze listening patterns
      const analysis = await this.analyzeListeningPatterns(history);
      
      // Update user's AI profile
      user.aiProfile = {
        lastUpdated: new Date(),
        personalityTraits: analysis.personalityTraits,
        contentPreferences: analysis.contentPreferences,
        moodPatterns: analysis.moodPatterns
      };

      await user.save();
      return user.aiProfile;
    } catch (error) {
      console.error('Error generating user profile:', error);
      throw error;
    }
  }

  // Analyze listening history to extract patterns
  async analyzeListeningPatterns(history) {
    const analysis = {
      personalityTraits: [],
      contentPreferences: [],
      moodPatterns: {
        happy: { count: 0, lastListened: null },
        sad: { count: 0, lastListened: null },
        stressed: { count: 0, lastListened: null },
        motivated: { count: 0, lastListened: null },
        relaxed: { count: 0, lastListened: null }
      }
    };

    // Analyze mood patterns
    history.forEach(entry => {
      if (entry.mood && analysis.moodPatterns[entry.mood]) {
        analysis.moodPatterns[entry.mood].count++;
        if (!analysis.moodPatterns[entry.mood].lastListened || 
            entry.listenedAt > analysis.moodPatterns[entry.mood].lastListened) {
          analysis.moodPatterns[entry.mood].lastListened = entry.listenedAt;
        }
      }
    });

    // Extract content preferences from podcast titles and descriptions
    const podcastIds = [...new Set(history.map(h => h.podcastId))];
    const podcasts = await Podcast.find({ podcastId: { $in: podcastIds } });
    
    const topics = new Set();
    podcasts.forEach(podcast => {
      if (podcast.keywords) {
        podcast.keywords.forEach(keyword => topics.add(keyword));
      }
    });

    analysis.contentPreferences = Array.from(topics);

    // Determine personality traits based on listening patterns
    analysis.personalityTraits = this.extractPersonalityTraits(history, analysis.moodPatterns);

    return analysis;
  }

  // Extract personality traits from listening behavior
  extractPersonalityTraits(history, moodPatterns) {
    const traits = [];
    
    // Analyze completion rates
    const completedCount = history.filter(h => h.completed).length;
    const completionRate = completedCount / history.length;
    
    if (completionRate > 0.8) traits.push('focused');
    if (completionRate < 0.3) traits.push('explorer');
    
    // Analyze listening duration patterns
    const avgDuration = history.reduce((sum, h) => sum + h.listenDuration, 0) / history.length;
    if (avgDuration > 1800) traits.push('deep-listener'); // > 30 minutes
    if (avgDuration < 600) traits.push('quick-consumer'); // < 10 minutes
    
    // Analyze mood preferences
    const moodCounts = Object.values(moodPatterns).map(m => m.count);
    const maxMood = Math.max(...moodCounts);
    const totalMood = moodCounts.reduce((sum, count) => sum + count, 0);
    
    if (maxMood / totalMood > 0.6) traits.push('consistent');
    if (totalMood > 20) traits.push('avid-listener');
    
    return traits;
  }

  // Generate personalized recommendations
  async getPersonalizedRecommendations(userId, currentMood = null) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Generate/update user profile if needed
      if (!user.aiProfile.lastUpdated || 
          Date.now() - user.aiProfile.lastUpdated > 24 * 60 * 60 * 1000) { // 24 hours
        await this.generateUserProfile(userId);
      }

      // Get recommendation criteria
      const criteria = this.buildRecommendationCriteria(user, currentMood);
      
      // Find matching podcasts
      const recommendations = await this.findMatchingPodcasts(criteria, user.listeningHistory);
      
      return recommendations;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }

  // Build recommendation criteria based on user profile and current mood
  buildRecommendationCriteria(user, currentMood) {
    const criteria = {
      excludePodcastIds: user.listeningHistory.map(h => h.podcastId),
      preferredKeywords: user.aiProfile.contentPreferences,
      personalityTraits: user.aiProfile.personalityTraits,
      moodPreferences: user.aiProfile.moodPatterns
    };

    // If current mood is provided, prioritize it
    if (currentMood && user.aiProfile.moodPatterns[currentMood]) {
      criteria.currentMood = currentMood;
    }

    return criteria;
  }

  // Find podcasts matching the criteria
  async findMatchingPodcasts(criteria, listeningHistory) {
    let query = {
      podcastId: { $nin: criteria.excludePodcastIds }
    };

    // Add keyword matching if available
    if (criteria.preferredKeywords && criteria.preferredKeywords.length > 0) {
      query.$or = [
        { keywords: { $in: criteria.preferredKeywords } },
        { title: { $regex: criteria.preferredKeywords.join('|'), $options: 'i' } }
      ];
    }

    // If a mood is selected, only show podcasts that match the mood
    if (criteria.currentMood) {
      const mood = criteria.currentMood;
      query.$or = [
        { keywords: { $in: [mood] } },
        { title: { $regex: mood, $options: 'i' } },
        { description: { $regex: mood, $options: 'i' } }
      ];
    }

    const podcasts = await Podcast.find(query).limit(20);
    
    // Score and rank podcasts
    const scoredPodcasts = podcasts.map(podcast => ({
      podcast,
      score: this.calculatePodcastScore(podcast, criteria, listeningHistory)
    }));

    // Sort by score and return top recommendations
    return scoredPodcasts
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.podcast);
  }

  // Calculate recommendation score for a podcast
  calculatePodcastScore(podcast, criteria, listeningHistory) {
    let score = 0;

    // Keyword matching
    if (criteria.preferredKeywords && podcast.keywords) {
      const matchingKeywords = criteria.preferredKeywords.filter(keyword => 
        podcast.keywords.includes(keyword)
      );
      score += matchingKeywords.length * 10;
    }

    // Title matching
    if (criteria.preferredKeywords) {
      const titleMatch = criteria.preferredKeywords.some(keyword =>
        podcast.title.toLowerCase().includes(keyword.toLowerCase())
      );
      if (titleMatch) score += 5;
    }

    // Mood boost: if currentMood is set, boost podcasts that match the mood
    if (criteria.currentMood) {
      const mood = criteria.currentMood.toLowerCase();
      // Boost if mood is in keywords
      if (podcast.keywords && podcast.keywords.map(k => k.toLowerCase()).includes(mood)) {
        score += 20;
      }
      // Boost if mood is in title
      if (podcast.title && podcast.title.toLowerCase().includes(mood)) {
        score += 10;
      }
      // Boost if mood is in description
      if (podcast.description && podcast.description.toLowerCase().includes(mood)) {
        score += 5;
      }
    }

    // Genre diversity (avoid recommending too many similar podcasts)
    const userGenres = listeningHistory.map(h => h.podcastTitle).slice(-5);
    const isSimilar = userGenres.some(title => 
      title.toLowerCase().includes(podcast.title.toLowerCase().split(' ')[0])
    );
    if (!isSimilar) score += 3;

    // Popularity boost (total episodes)
    if (podcast.total_episodes > 50) score += 2;

    return score;
  }

  // Generate default profile for new users
  generateDefaultProfile() {
    return {
      lastUpdated: new Date(),
      personalityTraits: ['explorer'],
      contentPreferences: [],
      moodPatterns: {
        happy: { count: 0, lastListened: null },
        sad: { count: 0, lastListened: null },
        stressed: { count: 0, lastListened: null },
        motivated: { count: 0, lastListened: null },
        relaxed: { count: 0, lastListened: null }
      }
    };
  }

  // Track user listening activity
  async trackListeningActivity(userId, podcastData, mood) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const listeningEntry = {
        podcastId: podcastData.podcastId,
        podcastTitle: podcastData.title,
        episodeId: podcastData.episodeId,
        episodeTitle: podcastData.episodeTitle,
        listenDuration: podcastData.duration || 0,
        completed: podcastData.completed || false,
        listenedAt: new Date(),
        mood: mood
      };

      user.listeningHistory.push(listeningEntry);
      
      // Keep only last 100 entries to prevent bloat
      if (user.listeningHistory.length > 100) {
        user.listeningHistory = user.listeningHistory.slice(-100);
      }

      await user.save();
      return listeningEntry;
    } catch (error) {
      console.error('Error tracking listening activity:', error);
      throw error;
    }
  }
}

export default new AIRecommendationService(); 