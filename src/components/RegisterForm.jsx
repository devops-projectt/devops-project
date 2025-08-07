import { useState } from 'react';
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Registration successful! Please log in.');
        setUsername('');
        setPassword('');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error or server not responding.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-96 max-w-full">
      <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">Register</h2>
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
      {success && <div className="text-green-500 mb-2 text-center">{success}</div>}
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 transition text-white py-3 w-full rounded-2xl font-semibold mt-4 shadow"
      >
        Register
      </button>
    </form>
  );
}

export default RegisterForm;
