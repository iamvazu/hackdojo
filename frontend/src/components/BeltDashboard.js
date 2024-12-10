import React from 'react';
import { Link } from 'react-router-dom';

const BeltDashboard = () => {
    const belts = [
        {
            name: 'White Belt',
            color: 'bg-white',
            textColor: 'text-gray-800',
            icon: '⚪',
            description: 'Begin your Python journey',
            dayStart: 1,
            dayEnd: 10
        },
        {
            name: 'Yellow Belt',
            color: 'bg-yellow-400',
            textColor: 'text-gray-800',
            icon: '🟡',
            description: 'Control flow and functions',
            dayStart: 11,
            dayEnd: 20
        },
        {
            name: 'Orange Belt',
            color: 'bg-orange-500',
            textColor: 'text-white',
            icon: '🟠',
            description: 'Data structures and algorithms',
            dayStart: 21,
            dayEnd: 30
        },
        {
            name: 'Green Belt',
            color: 'bg-green-500',
            textColor: 'text-white',
            icon: '🟢',
            description: 'Object-oriented programming',
            dayStart: 31,
            dayEnd: 40
        },
        {
            name: 'Blue Belt',
            color: 'bg-blue-500',
            textColor: 'text-white',
            icon: '🔵',
            description: 'File handling and modules',
            dayStart: 41,
            dayEnd: 50
        },
        {
            name: 'Purple Belt',
            color: 'bg-purple-500',
            textColor: 'text-white',
            icon: '🟣',
            description: 'Error handling and debugging',
            dayStart: 51,
            dayEnd: 60
        },
        {
            name: 'Brown Belt',
            color: 'bg-amber-800',
            textColor: 'text-white',
            icon: '🟤',
            description: 'Advanced Python concepts',
            dayStart: 61,
            dayEnd: 70
        },
        {
            name: 'Red Belt',
            color: 'bg-red-600',
            textColor: 'text-white',
            icon: '🔴',
            description: 'Web development with Python',
            dayStart: 71,
            dayEnd: 80
        },
        {
            name: 'Black Belt',
            color: 'bg-black',
            textColor: 'text-white',
            icon: '⚫',
            description: 'Master Python projects',
            dayStart: 81,
            dayEnd: 100
        }
    ];

    return (
        <div className="flex flex-row">
            {/* Left sidebar with belt buttons */}
            <div className="w-1/4 pr-4 space-y-2">
                {belts.map((belt) => (
                    <Link
                        key={belt.name}
                        to={`/lesson/day${belt.dayStart}`}
                        className="block w-full p-3 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                        {belt.name}
                    </Link>
                ))}
            </div>

            {/* Main content area */}
            <div className="w-3/4">
                <div className="space-y-4">
                    {belts.map((belt) => (
                        <Link
                            key={belt.name}
                            to={`/lesson/day${belt.dayStart}`}
                            className="block p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
                        >
                            <div className="flex items-center">
                                <span className="text-2xl mr-4">{belt.icon}</span>
                                <div className="flex-grow">
                                    <h3 className="text-white text-lg font-medium">{belt.name}</h3>
                                    <p className="text-gray-400">{belt.description}</p>
                                </div>
                                <span className="text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BeltDashboard;
