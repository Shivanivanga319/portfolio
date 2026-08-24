const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const Admin = require('./models/Admin');
const Project = require('./models/Project');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'Portfolio Full-Stack API',
  });
});

// Seed default admin and sample projects if DB is connected and empty
const seedInitialData = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';

      const newAdmin = new Admin({
        username: defaultUsername,
        password: defaultPassword, // pre-save hook will hash this with bcrypt
      });
      await newAdmin.save();
      console.log(`✨ Default admin created: Username "${defaultUsername}"`);
    }

    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const initialProjects = [
        {
          title: 'Mini CRM',
          description:
            'A full-stack Client Lead Management System (Mini CRM) designed to securely store, track, and manage incoming prospect inquiries using a protected admin panel with real-time database syncing, dynamic search filtering, live analytics, and interactive follow-up note logging.',
          tech: 'React, Node.js, MongoDB, CSS',
          order: 1,
        },
        {
          title: 'Portfolio',
          description:
            'A simple, responsive personal website built with React to showcase my projects, resume, and technical skills.',
          tech: 'React, CSS, Node.js, Express',
          order: 2,
        },
      ];
      await Project.insertMany(initialProjects);
      console.log('✨ Seeded initial portfolio projects into database');
    }
  } catch (error) {
    console.warn('⚠️ Seeding skipped or DB not yet ready:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedInitialData();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
