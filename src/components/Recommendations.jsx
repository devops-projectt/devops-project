import { useState, useEffect } from 'react';

const MOODS = [
  'sad',
  'surprised',
  'confident',
  'thoughtful',
  'happy',
  'angry',
  'calm',
  'tired'
];

// Helper to strip HTML tags from description
function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function Recommendations() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  // Fetch podcasts for the selected mood
  useEffect(() => {
    if (search) return; // Don't fetch mood if searching
    if (!selectedMood) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/podcasts?keyword=${encodeURIComponent(selectedMood)}`)
      .then((res) => res.json())
      .then((data) => {
        setPodcasts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedMood, search]);

  // Fetch podcasts for search
  useEffect(() => {
    if (!search) return;
    setSearching(true);
    setLoading(true);
    fetch(`http://localhost:3001/api/podcasts/search?q=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setPodcasts(data);
        setLoading(false);
        setSearching(false);
      })
      .catch(() => {
        setLoading(false);
        setSearching(false);
      });
  }, [search]);

  // Add/remove from favorites by podcastId
  const toggleFavorite = (podcast) => {
    const exists = favorites.find((fav) => fav.podcastId === podcast.podcastId);
    if (exists) {
      setFavorites(favorites.filter((fav) => fav.podcastId !== podcast.podcastId));
    } else {
      setFavorites([...favorites, podcast]);
    }
  };

  const isFavorite = (podcast) => favorites.some((fav) => fav.podcastId === podcast.podcastId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 pb-6">
      <h1 className="text-4xl font-bold text-purple-700 mb-4">🎧 MoodCast</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Choose your mood and get podcast recommendations!
      </p>

      {/* SEARCH BAR */}
      <div className="w-full max-w-2xl mb-6">
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            if (e.target.value === '') setSelectedMood(null);
          }}
          placeholder="Search podcasts by title or description..."
          className="w-full p-3 rounded-xl border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-lg"
        />
      </div>
      {/* END SEARCH BAR */}

      {/* MOOD BUTTONS */}
      {!search && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`border-2 border-purple-500 rounded-xl px-4 py-3 text-md font-medium bg-white shadow hover:bg-purple-50 transition
                ${selectedMood === mood ? 'bg-purple-100 border-purple-700' : ''}`}
            >
              {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </button>
          ))}
        </div>
      )}

      {(selectedMood || search) && (
        <div className="text-center w-full max-w-4xl">
          <h2 className="text-2xl font-semibold text-purple-600 mb-4">
            {search
              ? `Search results for: "${search}"`
              : `Recommendations for: ${selectedMood}`}
          </h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : podcasts.length === 0 ? (
            <p className="text-gray-500">No podcasts found{search ? ' for this search.' : ' for this mood.'}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {podcasts.map((podcast) => (
                <div key={podcast.podcastId} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 mb-8">
                  <img src={podcast.image} alt={podcast.title} className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1 text-left">
                    <a
                      href={podcast.listenotes_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-blue-600 hover:underline"
                    >
                      {podcast.title}
                    </a>
                    <p className="text-gray-700 text-sm mt-1 line-clamp-3">{stripHtml(podcast.description)}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500 mr-2">{podcast.publisher}</span>
                      <button
                        onClick={() => toggleFavorite(podcast)}
                        className={`text-xl ml-3 ${isFavorite(podcast) ? 'text-yellow-500' : 'text-gray-400'}`}
                        title={isFavorite(podcast) ? "Remove from favorites" : "Add to favorites"}
                      >
                        ⭐
                      </button>
                    </div>
                    {/* EPISODES LIST */}
                    {podcast.episodes && podcast.episodes.length > 0 && (
                      <div className="mt-4">
                        <div className="font-semibold text-purple-700 mb-2 text-sm">Latest Episodes:</div>
                        <ul className="space-y-4">
                          {podcast.episodes.slice(0, 1).map((ep) => (
                            <li key={ep.id} className="bg-purple-50 border border-purple-200 shadow-sm rounded-lg p-4 flex flex-col gap-2">
                              <div className="text-base font-semibold text-purple-900 mb-1">{ep.title}</div>
                              <div className="text-xs text-gray-600 line-clamp-2 mb-2">{stripHtml(ep.description)}</div>
                              <div className="flex items-center gap-2">
                                {ep.audio && (
                                  <audio controls className="w-full md:w-48">
                                    <source src={ep.audio} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                  </audio>
                                )}
                                <a href={ep.listenotes_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Listen Notes</a>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* END EPISODES LIST */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {favorites.length > 0 && (
        <div className="mt-10 w-full max-w-2xl">
          <h3 className="text-xl font-semibold text-purple-700 mb-2">⭐ Your Favorites</h3>
          <ul className="list-disc list-inside text-left">
            {favorites.map((podcast) => (
              <li key={podcast.podcastId}>
                <a
                  href={podcast.listenotes_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {podcast.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Recommendations;
