import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getBeltColor = (progress) => {
    const day = progress?.currentDay || 1;
    if (day <= 10) return 'bg-white text-gray-800';
    if (day <= 20) return 'bg-yellow-400 text-gray-800';
    if (day <= 30) return 'bg-orange-500 text-white';
    if (day <= 40) return 'bg-green-500 text-white';
    if (day <= 50) return 'bg-blue-500 text-white';
    if (day <= 60) return 'bg-purple-500 text-white';
    if (day <= 70) return 'bg-amber-800 text-white';
    if (day <= 80) return 'bg-red-600 text-white';
    return 'bg-black text-white';
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? '/student' : '/'} className="flex items-center">
              <span className="text-white text-xl font-bold">HackDojo</span>
            </Link>
          </div>

          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/student" className="text-gray-300 hover:text-white px-3 py-2">
                Home
              </Link>
              <Link to="/challenges" className="text-gray-300 hover:text-white px-3 py-2">
                Challenges
              </Link>
              <Link to="/progress" className="text-gray-300 hover:text-white px-3 py-2">
                My Progress
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white px-3 py-2"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && user && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/student"
              className="text-gray-300 hover:text-white block px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/challenges"
              className="text-gray-300 hover:text-white block px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Challenges
            </Link>
            <Link
              to="/progress"
              className="text-gray-300 hover:text-white block px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              My Progress
            </Link>
            <div className={`mx-3 py-1 px-3 rounded-full inline-block ${getBeltColor(user.progress)}`}>
              Day {user.progress?.currentDay || 1}
            </div>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="text-gray-300 hover:text-white block px-3 py-2 w-full text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
