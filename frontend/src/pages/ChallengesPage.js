import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPython, FaJava } from 'react-icons/fa';

const ChallengesPage = () => {
  const navigate = useNavigate();

  const courses = [
    {
      id: 'python-100',
      name: '100 Days in Python',
      description: 'Master Python through our innovative belt system. From basics to advanced concepts in 100 days.',
      icon: <FaPython className="text-5xl text-green-500 mb-4" />,
      path: '/student'
    },
    {
      id: 'java-ftc',
      name: 'Java for FTC',
      description: 'Learn Java programming for FIRST Tech Challenge robotics competition. Build real robot control systems.',
      icon: <FaJava className="text-5xl text-orange-500 mb-4" />,
      path: '/ftc'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Select a course to begin your coding journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border-2 border-transparent hover:border-indigo-500"
              onClick={() => navigate(course.path)}
            >
              <div className="text-center">
                {course.icon}
                <h2 className="text-2xl font-bold text-white mb-4">
                  {course.name}
                </h2>
                <p className="text-gray-300 text-lg">
                  {course.description}
                </p>
                <button
                  className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(course.path);
                  }}
                >
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;
