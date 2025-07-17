import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: String }], // Array of podcastId strings
  avatar: String,
  bio: String,
});

const User = mongoose.model('User', userSchema);

export default User;
