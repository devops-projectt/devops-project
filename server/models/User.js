import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [
    {
      name: String,
      url: String,
      mood: String
    }
  ],
  // New fields for AI recommendations
  listeningHistory: [
    {
      podcastId: String,
      podcastTitle: String,
      episodeId: String,
      episodeTitle: String,
      listenDuration: Number, // in seconds
      completed: Boolean,
      listenedAt: { type: Date, default: Date.now },
      mood: String // mood when listened
    }
  ],
  preferences: {
    favoriteGenres: [String],
    preferredEpisodeLength: {
      min: Number, // in minutes
      max: Number
    },
    preferredLanguages: [String],
    favoriteTopics: [String],
    listeningTime: {
      morning: Boolean,
      afternoon: Boolean,
      evening: Boolean,
      night: Boolean
    }
  },
  aiProfile: {
    lastUpdated: { type: Date, default: Date.now },
    personalityTraits: [String], // extracted from listening patterns
    contentPreferences: [String], // topics, styles, formats
    moodPatterns: {
      // tracks mood preferences over time
      happy: { count: Number, lastListened: Date },
      sad: { count: Number, lastListened: Date },
      stressed: { count: Number, lastListened: Date },
      motivated: { count: Number, lastListened: Date },
      relaxed: { count: Number, lastListened: Date }
    }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
