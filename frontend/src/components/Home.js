import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

const Home = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="py-16 text-center">
                    <h1 className="text-5xl font-bold mb-6 text-white">
                        Welcome to HackDojo
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Master Python through our innovative 100-day belt system. From beginner to expert, unlock your programming potential one belt at a time.
                    </p>
                    
                    {user ? (
                        <div className="space-y-6">
                            <p className="text-2xl font-semibold text-white">
                                Welcome back, {user.name || 'Student'}!
                            </p>
                            <Link
                                to="/student"
                                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                            >
                                Continue Your Journey
                            </Link>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link
                                to="/login"
                                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="inline-block bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                    
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-3 text-white">9 Belt Levels</h3>
                            <p className="text-gray-300">Progress through white to black belt, mastering Python concepts at each level.</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-3 text-white">100 Days</h3>
                            <p className="text-gray-300">Structured daily lessons designed to build your skills systematically.</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-3 text-white">AI-Powered</h3>
                            <p className="text-gray-300">Get personalized assistance and feedback as you learn and practice.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
