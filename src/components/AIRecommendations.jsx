import { useState, useEffect } from 'react';

const AIRecommendations = () => {
  const [aiProfile, setAiProfile] = useState(null);
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentMood, setCurrentMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const moods = [
    { name: 'happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-800', description: 'Uplifting and positive content' },
    { name: 'sad', emoji: '😢', color: 'bg-blue-100 text-blue-800', description: 'Comforting and empathetic stories' },
    { name: 'stressed', emoji: '😰', color: 'bg-red-100 text-red-800', description: 'Calming and stress-relief content' },
    { name: 'motivated', emoji: '💪', color: 'bg-green-100 text-green-800', description: 'Inspirational and goal-oriented content' },
    { name: 'relaxed', emoji: '😌', color: 'bg-purple-100 text-purple-800', description: 'Peaceful and mindful content' }
  ];

  useEffect(() => {
    loadAIProfile();
    loadInsights();
  }, []);

  const loadAIProfile = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAiProfile(data.profile);
        setSuccess(true);
      } else {
        setError('Failed to load AI profile');
      }
    } catch (error) {
      console.error('Error loading AI profile:', error);
      setError('Error loading AI profile');
    }
  };

  const loadInsights = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/insights', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
      } else {
        setError('Failed to load insights');
      }
    } catch (error) {
      console.error('Error loading insights:', error);
      setError('Error loading insights');
    }
  };

  const getAIRecommendations = async (mood = '') => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = mood 
        ? `/api/ai/recommendations?mood=${mood}`
        : '/api/ai/recommendations';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
        setSelectedMood(mood);
      } else {
        setError('Failed to get recommendations');
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setError('Error getting recommendations');
    } finally {
      setLoading(false);
    }
  };

  const trackListening = async (podcastData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          podcastData,
          mood: currentMood
        })
      });
      
      if (response.ok) {
        // Show success feedback
        alert(`🎧 Started tracking: ${podcastData.title}\n\nYour AI profile will update with this listening activity!`);
        
        // Refresh insights after tracking
        loadInsights();
        loadAIProfile();
      } else {
        alert('Failed to track listening activity. Please try again.');
      }
    } catch (error) {
      console.error('Error tracking listening:', error);
      alert('Error tracking listening activity. Please try again.');
    }
  };

  const savePodcast = (podcast) => {
    // Get existing favorites from localStorage
    const existingFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Check if already saved
    const isAlreadySaved = existingFavorites.some(fav => fav.name === podcast.title);
    
    if (isAlreadySaved) {
      alert('This podcast is already in your favorites!');
      return;
    }
    
    // Add to favorites
    const newFavorite = {
      name: podcast.title,
      url: podcast.listenotes_url || '#',
      mood: currentMood || 'general'
    };
    
    const updatedFavorites = [...existingFavorites, newFavorite];
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    alert(`✅ "${podcast.title}" saved to your favorites!`);
  };

  const getMoodEmoji = (moodName) => {
    const mood = moods.find(m => m.name === moodName);
    return mood ? mood.emoji : '🎧';
  };

  const getMoodColor = (moodName) => {
    const mood = moods.find(m => m.name === moodName);
    return mood ? mood.color : 'bg-gray-100 text-gray-800';
  };

  const getPersonalityDescription = (trait) => {
    const descriptions = {
      'explorer': 'You love discovering new content and trying different genres',
      'focused': 'You prefer to dive deep into specific topics and complete episodes',
      'deep-listener': 'You enjoy longer, more detailed content',
      'quick-consumer': 'You prefer shorter, concise episodes',
      'consistent': 'You have clear preferences and stick to what you like',
      'avid-listener': 'You listen to podcasts frequently and regularly'
    };
    return descriptions[trait] || trait;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-700 flex items-center gap-2 mb-2">
          🧠 AI-Powered Recommendations
        </h1>
        <p className="text-gray-600">
          Your personal AI assistant learns from your listening habits to suggest the perfect podcasts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-green-800 font-semibold">✅ AI System Connected</h3>
          <p className="text-green-600">Your AI assistant is ready to provide personalized recommendations!</p>
        </div>
      )}

      {/* AI Profile & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Profile */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-purple-700 flex items-center gap-2 mb-4">
            👤 Your AI Profile
          </h2>
          {aiProfile ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Personality Traits</h3>
                <div className="space-y-2">
                  {aiProfile.personalityTraits.map((trait, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {trait}
                      </span>
                      <p className="text-sm text-gray-600 flex-1">
                        {getPersonalityDescription(trait)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Content Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {aiProfile.contentPreferences.length > 0 ? (
                    aiProfile.contentPreferences.slice(0, 5).map((pref, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {pref}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Start listening to podcasts to discover your preferences!</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading your AI profile...</p>
          )}
        </div>

        {/* Listening Insights */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-purple-700 flex items-center gap-2 mb-4">
            📊 Listening Insights
          </h2>
          {insights ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-red-500">❤️</span>
                <span className="text-gray-700">
                  Favorite Mood: <span className="font-medium">{insights.favoriteMood || 'None yet'}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(aiProfile?.moodPatterns || {}).map(([mood, data]) => (
                  <div key={mood} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-1">{getMoodEmoji(mood)}</div>
                    <div className="text-sm font-medium text-gray-700 capitalize">{mood}</div>
                    <div className="text-lg font-bold text-purple-600">{data.count}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading insights...</p>
          )}
        </div>
      </div>

      {/* Mood Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">
          How are you feeling today?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {moods.map((mood) => (
            <button
              key={mood.name}
              onClick={() => {
                setCurrentMood(mood.name);
                getAIRecommendations(mood.name);
              }}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                currentMood === mood.name
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">{mood.emoji}</div>
              <div className="font-semibold text-gray-800 capitalize">{mood.name}</div>
              <div className="text-xs text-gray-600 mt-1">{mood.description}</div>
            </button>
          ))}
        </div>
        <button
          onClick={() => getAIRecommendations()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Get General Recommendations
        </button>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-purple-700 flex items-center gap-2">
            ✨ AI Recommendations
            {selectedMood && (
              <span className={`ml-2 px-3 py-1 rounded-full text-sm ${getMoodColor(selectedMood)}`}>
                {getMoodEmoji(selectedMood)} {selectedMood}
              </span>
            )}
          </h2>
          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              Analyzing your preferences...
            </div>
          )}
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((podcast) => (
              <div key={podcast.podcastId} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <img 
                    src={podcast.image} 
                    alt={podcast.title}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x64?text=🎧';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                      {podcast.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {podcast.publisher}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>⏱️</span>
                      {podcast.total_episodes} episodes
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => trackListening({
                      podcastId: podcast.podcastId,
                      title: podcast.title,
                      episodeId: podcast.episodes?.[0]?.id,
                      episodeTitle: podcast.episodes?.[0]?.title,
                      duration: 0,
                      completed: false
                    })}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                  >
                    ▶️ Start Listening
                  </button>
                  <button 
                    onClick={() => savePodcast(podcast)}
                    className="px-3 py-2 border border-purple-600 text-purple-600 text-sm rounded-lg hover:bg-purple-50 transition-colors"
                    title="Save to favorites"
                  >
                    🔖
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">✨</span>
            <p>Select a mood or get general recommendations to see AI-powered suggestions.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AIRecommendations; 