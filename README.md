# Full-Stack Dynamic Portfolio & Admin Dashboard

A full-stack, responsive portfolio website built with **React, Node.js, Express, MongoDB, and JWT Authentication**.

Includes a public showcase website for recruiters/friends and a private, protected **Admin Dashboard** (`/admin`) for effortlessly managing projects, updating tech stacks, and uploading new resume versions without touching source code.

---

## 🌟 Key Features

- 🌐 **Dynamic Public Showcase**: Renders personal bio, technical skills, live-synced projects, and direct resume download.
- 🔒 **Secure Private Admin Dashboard (`/admin`)**:
  - Protected with JWT (JSON Web Tokens) and bcrypt password hashing.
  - **Project Management**: Add new projects, edit existing ones, or delete outdated projects in real time.
  - **Resume PDF Manager**: Upload new resume PDF files directly through the dashboard.
  - **Account Settings**: Update admin credentials and passwords securely.
- ⚡ **Graceful Offline Fallback**: The frontend displays default portfolio content if the backend is waking up or offline.
- 🎨 **Unified Aesthetic**: Consistent deep-ocean and neon teal design across all public and admin interfaces.

---

## 📁 Project Structure

```text
portfolio-main/
├── public/                 # Static assets (Resume.pdf, favicon, index.html)
├── src/
│   ├── components/         # Reusable components (ProtectedRoute, etc.)
│   ├── pages/              # AdminLogin.js, AdminDashboard.js
│   ├── services/           # api.js (Centralized API client)
│   ├── App.js              # Routing and public portfolio sections
│   ├── index.css           # Global theme styling
│   └── admin.css           # Admin dashboard styling
├── server/
│   ├── config/             # MongoDB connection configuration (db.js)
│   ├── middleware/         # auth.js (JWT authentication middleware)
│   ├── models/             # Mongoose schemas (Project.js, Admin.js)
│   ├── routes/             # authRoutes.js, projectRoutes.js, resumeRoutes.js
│   ├── uploads/            # Active uploaded files (Resume.pdf)
│   ├── .env.example        # Environment variable template
│   ├── .env                # Local environment configuration
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express API server entry point
├── package.json            # Frontend dependencies & root scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Configuration

1. Navigate to the `server/` directory:
   ```bash
   cd server
   npm install
   ```

2. Configure your `.env` file in `server/`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/portfolio # Or your MongoDB Atlas connection string
   JWT_SECRET=super_secret_jwt_key_portfolio_2026
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   CLIENT_URL=http://localhost:3000
   ```

3. Start the Express server:
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

### 2. Frontend Setup

1. In the main project directory:
   ```bash
   npm install
   npm start
   ```
2. The portfolio will open at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔐 Accessing the Admin Dashboard

1. Visit **[http://localhost:3000/admin](http://localhost:3000/admin)** or click the **Admin Portal 🔒** link in the footer.
2. Sign in with your configured admin credentials:
   - **Default Username:** `admin`
   - **Default Password:** `admin123`
3. After logging in, you will be redirected to the **Admin Dashboard** where you can:
   - ➕ **Add / Edit Projects**: Enter project title, description, tech stack tags, and links.
   - 🗑️ **Delete Projects**: Remove old projects instantly.
   - 📄 **Upload Resume**: Select and upload a new `Resume.pdf`.
   - 🔑 **Change Password**: Update your admin password from the settings tab.

---

## ☁️ Setting Up Free MongoDB Atlas (Optional Cloud DB)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 cluster and database user.
3. Click **Connect** > **Drivers** and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
4. Paste this connection string into `server/.env` as your `MONGO_URI`.
