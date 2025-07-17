// server/models/Recommendation.js
import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  name: String,         // שם הפודקאסט
  url: String,          // קישור לפודקאסט
  mood: String          // מצב הרוח (happy, sad, etc)
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

export default Recommendation;
