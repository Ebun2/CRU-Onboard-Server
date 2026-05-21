const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const { protect, adminProtect } = require('../middleware/auth');

// @route   GET /api/topics
// @desc    Get all published topics (for students)
router.get('/', protect, async (req, res) => {
  try {
    const topics = await Topic.find({ isPublished: true }).sort({ order: 1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/topics/:id
// @desc    Get single topic by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/topics/admin/all
// @desc    Get all topics including unpublished (for admin)
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const topics = await Topic.find().sort({ order: 1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/topics
// @desc    Create a new topic (admin only)
// router.post('/', adminProtect, async (req, res) => {
//   try {
//     const { title, description, content, order, isPublished } = req.body;
//     const topic = await Topic.create({
//       title,
//       description,
//       content,
//       order,
//       isPublished
//     });
//     res.status(201).json(topic);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
router.post('/', adminProtect, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { title, description, content, order, isPublished, category } = req.body;
    console.log('Category received:', category);
    const topic = await Topic.create({
      title,
      description,
      content,
      order,
      isPublished,
      category
    });
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/topics/:id
// @desc    Update a topic (admin only)
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/topics/:id
// @desc    Delete a topic (admin only)
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;