const express = require('express');
const router = express.Router();
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const Topic = require('../models/Topic');
const { adminProtect } = require('../middleware/auth');

// @route   GET /api/admin/students
// @desc    Get all registered students
router.get('/students', adminProtect, async (req, res) => {
  try {
    const students = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/students/:id/progress
// @desc    Get a specific student's quiz progress
router.get('/students/:id/progress', adminProtect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ studentId: req.params.id })
      .populate('topicId', 'title')
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/progress
// @desc    Get all quiz attempts (all students)
router.get('/progress', adminProtect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find()
      .populate('studentId', 'fullName email cruNumber department')
      .populate('topicId', 'title')
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
router.get('/stats', adminProtect, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments();
    const totalTopics = await Topic.countDocuments({ isPublished: true });
    const totalAttempts = await QuizAttempt.countDocuments();
    const passedAttempts = await QuizAttempt.countDocuments({ passed: true });

    res.json({
      totalStudents,
      totalTopics,
      totalAttempts,
      passedAttempts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/students/:id
// @desc    Delete a student
router.delete('/students/:id', adminProtect, async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/dsa/results
// @desc    Get all quiz results grouped by passed/failed (for DSA)
router.get('/dsa/results', adminProtect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find()
      .populate('studentId', 'fullName email cruNumber department')
      .populate('topicId', 'title category')
      .sort({ createdAt: -1 });

    const passed = attempts.filter(a => a.passed);
    const failed = attempts.filter(a => !a.passed);

    res.json({ passed, failed, total: attempts.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;