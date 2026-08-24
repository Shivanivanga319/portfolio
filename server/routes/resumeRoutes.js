const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Keep consistent filename for main resume
    cb(null, 'Resume.pdf');
  },
});

// File filter to only allow PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB limit
  },
});

// @route   GET /api/resume
// @desc    Get current resume status & metadata
// @access  Public
router.get('/', (req, res) => {
  const filePath = path.join(uploadsDir, 'Resume.pdf');
  const publicResumePath = path.join(__dirname, '../../public/Resume.pdf');

  let activePath = null;
  if (fs.existsSync(filePath)) {
    activePath = filePath;
  } else if (fs.existsSync(publicResumePath)) {
    activePath = publicResumePath;
  }

  if (activePath && fs.existsSync(activePath)) {
    const stats = fs.statSync(activePath);
    return res.json({
      success: true,
      exists: true,
      filename: 'Resume.pdf',
      downloadUrl: '/api/resume/download',
      sizeBytes: stats.size,
      updatedAt: stats.mtime,
    });
  }

  res.json({
    success: true,
    exists: false,
    downloadUrl: '/Resume.pdf',
    message: 'Default resume in public folder',
  });
});

// @route   GET /api/resume/download
// @desc    Download the active resume PDF
// @access  Public
router.get('/download', (req, res) => {
  const uploadsFilePath = path.join(uploadsDir, 'Resume.pdf');
  const publicResumePath = path.join(__dirname, '../../public/Resume.pdf');

  if (fs.existsSync(uploadsFilePath)) {
    return res.download(uploadsFilePath, 'Resume.pdf');
  } else if (fs.existsSync(publicResumePath)) {
    return res.download(publicResumePath, 'Resume.pdf');
  }

  res.status(404).json({ success: false, message: 'Resume file not found' });
});

// @route   POST /api/resume/upload
// @desc    Upload / replace resume PDF
// @access  Protected (Admin only)
router.post('/upload', protect, (req, res) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a PDF file to upload' });
    }

    // Also sync to frontend public/ folder if available
    try {
      const publicDir = path.join(__dirname, '../../public');
      if (fs.existsSync(publicDir)) {
        fs.copyFileSync(req.file.path, path.join(publicDir, 'Resume.pdf'));
      }
    } catch (syncErr) {
      console.warn('Notice: could not mirror to public/Resume.pdf:', syncErr.message);
    }

    const stats = fs.statSync(req.file.path);

    res.json({
      success: true,
      message: 'Resume PDF uploaded successfully!',
      downloadUrl: '/api/resume/download',
      sizeBytes: stats.size,
      updatedAt: stats.mtime,
    });
  });
});

module.exports = router;
