const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// In-memory fallback projects store
let fallbackProjects = [
  {
    _id: 'proj_1',
    title: 'Mini CRM',
    description:
      'A full-stack Client Lead Management System (Mini CRM) designed to securely store, track, and manage incoming prospect inquiries using a protected admin panel with real-time database syncing, dynamic search filtering, live analytics, and interactive follow-up note logging.',
    tech: 'React, Node.js, MongoDB, CSS',
    githubUrl: '',
    liveUrl: '',
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'proj_2',
    title: 'Portfolio',
    description:
      'A simple, responsive personal website built with React to showcase my projects, resume, and technical skills.',
    tech: 'React, CSS, Node.js, Express',
    githubUrl: '',
    liveUrl: '',
    order: 2,
    createdAt: new Date().toISOString(),
  },
];

// @route   GET /api/projects
// @desc    Get all portfolio projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const projects = await Project.find().sort({ order: 1, createdAt: -1 });
      return res.json({
        success: true,
        count: projects.length,
        data: projects,
      });
    }

    // Return in-memory projects
    res.json({
      success: true,
      count: fallbackProjects.length,
      data: fallbackProjects,
      mode: 'in-memory',
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.json({
      success: true,
      count: fallbackProjects.length,
      data: fallbackProjects,
      mode: 'fallback',
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get a single project by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    if (isDBConnected()) {
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      return res.json({ success: true, data: project });
    }

    const project = fallbackProjects.find((p) => p._id === req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving project' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Protected (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, tech, githubUrl, liveUrl, order } = req.body;

    if (!title || !description || !tech) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and tech stack are required',
      });
    }

    if (isDBConnected()) {
      const project = await Project.create({
        title: title.trim(),
        description: description.trim(),
        tech: tech.trim(),
        githubUrl: githubUrl ? githubUrl.trim() : '',
        liveUrl: liveUrl ? liveUrl.trim() : '',
        order: order !== undefined ? Number(order) : 0,
      });

      return res.status(201).json({
        success: true,
        message: 'Project created successfully in MongoDB',
        data: project,
      });
    }

    // In-memory fallback creation
    const newProject = {
      _id: 'proj_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      tech: tech.trim(),
      githubUrl: githubUrl ? githubUrl.trim() : '',
      liveUrl: liveUrl ? liveUrl.trim() : '',
      order: order !== undefined ? Number(order) : 0,
      createdAt: new Date().toISOString(),
    };

    fallbackProjects.unshift(newProject);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: 'Server error creating project' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Protected (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, tech, githubUrl, liveUrl, order } = req.body;

    if (isDBConnected()) {
      let project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      if (title !== undefined) project.title = title.trim();
      if (description !== undefined) project.description = description.trim();
      if (tech !== undefined) project.tech = tech.trim();
      if (githubUrl !== undefined) project.githubUrl = githubUrl.trim();
      if (liveUrl !== undefined) project.liveUrl = liveUrl.trim();
      if (order !== undefined) project.order = Number(order);

      const updatedProject = await project.save();

      return res.json({
        success: true,
        message: 'Project updated successfully',
        data: updatedProject,
      });
    }

    // In-memory fallback update
    const projIndex = fallbackProjects.findIndex((p) => p._id === req.params.id);
    if (projIndex === -1) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (title !== undefined) fallbackProjects[projIndex].title = title.trim();
    if (description !== undefined) fallbackProjects[projIndex].description = description.trim();
    if (tech !== undefined) fallbackProjects[projIndex].tech = tech.trim();
    if (githubUrl !== undefined) fallbackProjects[projIndex].githubUrl = githubUrl.trim();
    if (liveUrl !== undefined) fallbackProjects[projIndex].liveUrl = liveUrl.trim();
    if (order !== undefined) fallbackProjects[projIndex].order = Number(order);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: fallbackProjects[projIndex],
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, message: 'Server error updating project' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Protected (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (isDBConnected()) {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      await project.deleteOne();

      return res.json({
        success: true,
        message: 'Project deleted successfully',
        data: { id: req.params.id },
      });
    }

    const projIndex = fallbackProjects.findIndex((p) => p._id === req.params.id);
    if (projIndex === -1) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    fallbackProjects.splice(projIndex, 1);

    res.json({
      success: true,
      message: 'Project deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, message: 'Server error deleting project' });
  }
});

module.exports = router;
