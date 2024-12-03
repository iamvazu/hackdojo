# HackDojo - Interactive Coding Education Platform

HackDojo is a web-based coding education platform designed specifically for children. It provides an engaging and interactive environment for young learners to develop their programming skills while allowing parents to track their progress.

## Features

- 👨‍👩‍👧‍👦 Parent and Child User Management
- 📊 Progress Tracking System
- 🏆 Achievement and Badge System
- 💻 Interactive Code Assessment
- 🔒 Secure Authentication
- 📱 Responsive Design

## Tech Stack

- **Frontend**: React.js
- **Backend**: Flask (Python)
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/hackdojo-ui-ux-enhancements.git
cd hackdojo-ui-ux-enhancements
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
flask run
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
hackdojo-ui-ux-enhancements/
├── backend/
│   ├── app.py           # Main Flask application
│   ├── schema.sql       # Database schema
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── App.js       # Root component
│   └── package.json     # Node.js dependencies
└── README.md
```

## Database Schema

The application uses SQLite with the following main tables:
- `users`: Parent login credentials and information
- `child_profile`: Child user information and learning goals
- `progress`: Track individual child's learning progress
- `achievement`: Store earned badges and milestones

## Security Features

- Password hashing for user security
- JWT-based authentication
- Role-based access control
- Email validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
