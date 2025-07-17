# MoodCast – Full Stack Podcast Recommendation App

MoodCast is a modern full stack web application that recommends podcasts based on your current mood. Users can discover, listen to, and save their favorite podcasts, all in a seamless, responsive interface.

---

## 🚀 Project Overview

MoodCast leverages real podcast data and advanced search to deliver personalized recommendations. The app features secure authentication, user profiles, persistent favorites, and in-app episode playback—all built with a robust, scalable tech stack.

---

## ✨ Key Features

- **Mood-Based Podcast Recommendations:** Get podcast suggestions tailored to your selected mood.
- **User Authentication:** Secure JWT-based login and registration.
- **User Profiles:** View and edit your profile, including avatar and bio.
- **Favorites:** Save and manage your favorite podcasts.
- **Episode Playback:** Listen to podcast episodes directly in the app.
- **Full-Text Search:** Search podcasts by title or description.
- **Responsive UI:** Clean, modern design with Tailwind CSS.
- **Real Data:** Fetches and caches live podcast data from the Listen Notes API.

---

## 🛠️ Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, Heroicons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **External API:** Listen Notes API

---

## ⚡ Installation & Local Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/moodcast.git
   cd moodcast
   ```

2. **Install dependencies:**
   - **Backend:**
     ```sh
     cd server
     npm install
     ```
   - **Frontend:**
     ```sh
     cd ../
     npm install
     ```

3. **Set up environment variables:**
   - Create a `.env` file in the root and add your MongoDB Atlas URI and Listen Notes API key:
     ```
     MONGODB_URI=your_mongodb_atlas_uri
     LISTEN_NOTES_API_KEY=your_listennotes_api_key
     ```

4. **Import podcast data:**
   ```sh
   node importFromListenNotes.js
   ```

5. **Start the backend server:**
   ```sh
   cd server
   npm start
   ```

6. **Start the frontend:**
   ```sh
   cd ../
   npm run dev
   ```

7. **Open your browser:**  
   Visit [http://localhost:5173](http://localhost:5173) to use MoodCast.

---

## 📡 Example API Endpoint

- **Search Podcasts by Mood:**
  ```
  GET /api/podcasts?keyword=happy
  ```
- **Full-Text Search:**
  ```
  GET /api/podcasts/search?q=meditation
  ```

---

## �� Folder Structure

```
moodcast/
├── server/
│   ├── models/           # Mongoose models (Podcast, User)
│   ├── routes/           # Express route handlers (podcasts, auth, user)
│   └── ...               # Other backend files
├── src/
│   ├── components/       # React components (Recommendations, Profile, Header, etc.)
│   ├── App.jsx           # Main React app
│   └── ...               # Other frontend files
├── importFromListenNotes.js  # Podcast data import script
├── README.md
└── package.json
```

---

## 🙏 Credits & Acknowledgments

- [Listen Notes API](https://www.listennotes.com/api/) for podcast data.
- [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database hosting.
- [Tailwind CSS](https://tailwindcss.com/) and [Heroicons](https://heroicons.com/) for UI design.

---

## 📬 Contact

For questions or feedback, please open an issue or contact [your email or GitHub profile].

```

---

Let me know if you want to customize any section or need help with deployment instructions!
