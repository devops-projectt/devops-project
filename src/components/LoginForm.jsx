import { useState } from 'react';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        onLogin();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-96 max-w-full">
      <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">Login</h2>
      <input
        className="border border-purple-300 p-3 w-full mb-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoFocus
      />
      <input
        className="border border-purple-300 p-3 w-full mb-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 transition text-white py-3 w-full rounded-2xl font-semibold mt-4 shadow"
      >
        Login
      </button>
    </form>
  );
}

export default LoginForm;
