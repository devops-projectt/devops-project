import { useEffect, useState } from 'react';

function Profile() {
  const [profile, setProfile] = useState({ username: '', avatar: '', bio: '' });
  const [favorites, setFavorites] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchProfileAndFavorites() {
      setLoading(true);
      setError('');
      try {
        // Fetch profile
        const resProfile = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resProfile.ok) throw new Error('Failed to fetch profile');
        const profileData = await resProfile.json();
        setProfile(profileData);
        setAvatar(profileData.avatar || '');
        setBio(profileData.bio || '');

        // Fetch favorites (array of podcastIds)
        const resFav = await fetch('/api/user/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resFav.ok) throw new Error('Failed to fetch favorites');
        const favIds = await resFav.json();

        // Fetch podcast details for each favorite
        const podcasts = await Promise.all(
          favIds.map(async (id) => {
            const res = await fetch(`/api/podcasts?podcastId=${id}`);
            const data = await res.json();
            return data[0]; // API returns an array
          })
        );
        setFavorites(podcasts.filter(Boolean));
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchProfileAndFavorites();
    // eslint-disable-next-line
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ avatar, bio })
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      setProfile(updated);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading profile...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">Profile</h2>
      <div className="flex flex-col items-center mb-6">
        <img
          src={profile.avatar || 'https://ui-avatars.com/api/?name=' + profile.username}
          alt="avatar"
          className="w-24 h-24 rounded-full border-4 border-purple-300 mb-2"
        />
        <span className="text-xl font-semibold">{profile.username}</span>
      </div>
      {editMode ? (
        <form onSubmit={handleSave} className="mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Avatar URL</label>
            <input
              className="border p-2 w-full rounded"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Bio</label>
            <textarea
              className="border p-2 w-full rounded"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>
          <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded font-semibold mr-2">Save</button>
          <button type="button" className="bg-gray-300 px-6 py-2 rounded font-semibold" onClick={() => setEditMode(false)}>Cancel</button>
        </form>
      ) : (
        <div className="mb-6">
          <div className="mb-2"><span className="font-semibold">Bio:</span> {profile.bio || <span className="text-gray-400">No bio</span>}</div>
          <button className="bg-purple-600 text-white px-6 py-2 rounded font-semibold" onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}
      <h3 className="text-xl font-semibold text-purple-700 mb-2">⭐ Your Favorites</h3>
      {favorites.length === 0 ? (
        <div className="text-gray-500">No favorites yet.</div>
      ) : (
        <ul className="space-y-2">
          {favorites.map(podcast => (
            <li key={podcast.podcastId} className="flex items-center gap-4 bg-gray-50 rounded p-2">
              <img src={podcast.image} alt={podcast.title} className="w-12 h-12 rounded" />
              <div>
                <a href={podcast.listenotes_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">{podcast.title}</a>
                <div className="text-xs text-gray-500">{podcast.publisher}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Profile; 