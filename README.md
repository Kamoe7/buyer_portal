# REALstate.io — Buyer Portal 

A simple full-stack real estate buyer portal where users can sign up, log in, and save their favorite properties.

Built with a clean and minimal stack, focusing on authentication, state management, and a smooth user experience.

# Tech Stack
Backend: Node.js, Express, SQLite (via better-sqlite3)
Authentication: JWT + bcrypt (for secure password hashing)
Frontend: React 18 + React Router
Database: SQLite (no setup needed, runs out of the box)

# Project Structure
buyer-portal/
├── backend/
│   ├── src/
│   │   ├── index.js          # Entry point (Express server)
│   │   ├── db.js             # Database setup + seed data
│   │   ├── middleware.js     # JWT auth middleware
│   │   ├── authRoutes.js     # Auth routes (login/register/me)
│   │   └── propertyRoutes.js # Property + favourites logic
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js  # Handles auth state globally
    │   ├── pages/
    │   │   ├── AuthPage.js     # Login / Register UI
    │   │   └── Dashboard.js    # Main app (properties + favourites)
    │   ├── components/
    │   │   └── Toast.js        # Notifications
    │   ├── App.js              # Routing + protected routes
    │   ├── index.js            # React entry point
    │   └── index.css           # Styling 
    └── package.json


# How to Run the Project
Prerequisites

Make sure you have:

Node.js (v18 or higher)
npm
# 1 Start the Backend
cd backend
npm install
npm start

Backend will run on:
http://localhost:4000

For development (auto reload):

npm run dev

# 2 Start the Frontend

Open a new terminal:

cd frontend
npm install
npm start

Frontend will run on:
http://localhost:3000

The frontend automatically talks to the backend via /api/* (proxy is already set up).

# 3 How the App Works
New User Flow
Open the app in your browser
Click Sign Up and enter your details
You’ll be logged in automatically
Browse properties and click 🤍 to save them
Go to My Favourites to see saved properties
Click again to remove them
Returning User
Log in with your email and password
Your saved favourites will still be there
API Overview

# All protected routes require:

Authorization: Bearer <your_token>
Auth Routes
POST /api/auth/register → Create account
POST /api/auth/login → Login & get token
GET /api/auth/me → Get current user
Property Routes (Protected)
GET /api/properties → Get all properties
GET /api/properties/favourites → Get your favourites
POST /api/properties/:id/favourite → Toggle favourite
DELETE /api/properties/:id/favourite → Remove favourite
# Security Notes
Passwords are hashed using bcrypt (not stored in plain text)
JWT tokens expire after 7 days
Auth is handled securely using middleware
Users can only access their own data
SQLite handles relationships and cleans up data automatically
# Environment Variables

You can customize these:

Variable	Default	Description
PORT	4000	Backend port
JWT_SECRET		JWT secret key

Example:

JWT_SECRET=my-secret-key PORT=4000 npm start