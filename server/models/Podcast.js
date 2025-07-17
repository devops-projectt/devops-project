import mongoose from 'mongoose';

const podcastSchema = new mongoose.Schema({
  podcastId: { type: String, required: true, unique: true }, // Listen Notes ID
  title: String,
  description: String,
  image: String,
  publisher: String,
  language: String,
  total_episodes: Number,
  listenotes_url: String,
  genres: [Number], // Listen Notes genre IDs
  keywords: [String], // Keywords/moods used for fetching
  episodes: [
    {
      id: String,
      title: String,
      description: String,
      audio: String,
      pub_date_ms: Number,
      listenotes_url: String,
    }
  ],
  lastFetched: { type: Date, default: Date.now }
});

const Podcast = mongoose.model('Podcast', podcastSchema);

export default Podcast;
