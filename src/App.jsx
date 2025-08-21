import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Recommendations from "./components/Recommendations";
import AIRecommendations from "./components/AIRecommendations";
import Profile from "./components/Profile";
import Header from "./components/Header";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <AppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
}

function AppContent({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 pt-24">
      <div className="flex flex-col items-center mb-8">
        <span className="text-4xl font-bold text-purple-700 flex items-center gap-2">
          <span role="img" aria-label="headphones">🎧</span> MoodCast
        </span>
        <span className="text-gray-600 mt-2 text-lg">
          Login or Register to continue 1234
        </span>
      </div>

      {/* טאבים */}
      <div className="flex gap-4 mb-2 justify-center">
        {!isLoggedIn && (
          <>
            <NavLink
              to="/login"
              end
              className={({ isActive }) =>
                isActive
                  ? "px-28 py-4 rounded-full text-lg font-semibold transition duration-200 bg-purple-600 text-white shadow"
                  : "px-28 py-4 rounded-full text-lg font-semibold transition duration-200 bg-white border-2 border-purple-600 text-purple-700 hover:bg-purple-100 hover:text-purple-900 focus:outline-none"
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `px-28 py-4 rounded-full text-lg font-semibold transition duration-200
                ${isActive
                  ? "bg-purple-600 text-white shadow"
                  : "bg-white border-2 border-purple-600 text-purple-700 hover:bg-purple-100 hover:text-purple-900 focus:outline-none"}
                `
              }
            >
              Register
            </NavLink>
          </>
        )}
        {isLoggedIn && (
          <>
            <NavLink
              to="/recommendations"
              className={({ isActive }) =>
                `w-48 py-4 rounded-full text-lg font-semibold text-center transition duration-200
                ${isActive
                  ? "bg-purple-600 text-white shadow"
                  : "bg-white border-2 border-purple-600 text-purple-700 hover:bg-purple-100 hover:text-purple-900 focus:outline-none"}
                `
              }
            >
              Recommendations
            </NavLink>
            <NavLink
              to="/ai-recommendations"
              className={({ isActive }) =>
                `w-48 py-4 rounded-full text-lg font-semibold text-center transition duration-200
                ${isActive
                  ? "bg-purple-600 text-white shadow"
                  : "bg-white border-2 border-purple-600 text-purple-700 hover:bg-purple-100 hover:text-purple-900 focus:outline-none"}
                `
              }
            >
              AI Assistant
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `w-48 py-4 rounded-full text-lg font-semibold text-center transition duration-200
                ${isActive
                  ? "bg-purple-600 text-white shadow"
                  : "bg-white border-2 border-purple-600 text-purple-700 hover:bg-purple-100 hover:text-purple-900 focus:outline-none"}
                `
              }
            >
              Profile
            </NavLink>
          </>
        )}
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Navigate to={isLoggedIn ? "/recommendations" : "/login"} />} />
        <Route path="/login" element={<LoginForm onLogin={() => {
          setIsLoggedIn(true);
          navigate('/recommendations');
        }} />} />
        <Route path="/register" element={<RegisterForm />} />
        {isLoggedIn && <Route path="/profile" element={<Profile />} />}
        {isLoggedIn && <Route path="/recommendations" element={<Recommendations />} />}
        {isLoggedIn && <Route path="/ai-recommendations" element={<AIRecommendations />} />}
        {/* Protect routes: redirect to login if not logged in */}
        {!isLoggedIn && <Route path="/profile" element={<Navigate to="/login" />} />}
        {!isLoggedIn && <Route path="/recommendations" element={<Navigate to="/login" />} />}
        {!isLoggedIn && <Route path="/ai-recommendations" element={<Navigate to="/login" />} />}
      </Routes>
    </div>
  );
}

export default App;
