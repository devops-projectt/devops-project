// server/seed.js
import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import Recommendation from './models/Recommendation.js';
import connectDB from './db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // שלב 1: קריאה מהקובץ
    const data = fs.readFileSync('./server/recommendations.json', 'utf-8');
    const raw = JSON.parse(data);

    // שלב 2: המרה למערך שטוח עם mood
    const recommendations = [];

    for (const mood in raw) {
      raw[mood].forEach((rec) => {
        recommendations.push({ ...rec, mood });
      });
    }

    // שלב 3: ניקוי ישן
    await Recommendation.deleteMany({});
    console.log('✅ Old data cleared');

    // שלב 4: הזרעה למסד
    await Recommendation.insertMany(recommendations);
    console.log('✅ Database seeded successfully');

    process.exit();
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
