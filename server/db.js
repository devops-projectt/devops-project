import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://mooduser:mood2402@moodcast-cluster.8nvomyn.mongodb.net/moodcast?retryWrites=true&w=majority&appName=moodcast-cluster');
    console.log('✅ MongoDB connected!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('💡 Tip: Make sure your IP address is whitelisted in MongoDB Atlas');
    // Don't exit process in development - let the app run without DB for frontend testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
