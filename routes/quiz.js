const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const Topic = require('../models/Topic');
const { protect, adminProtect } = require('../middleware/auth');
const { sendQuizResultEmail } = require('../utils/email');

router.post('/questions/add', adminProtect, async (req, res) => {
  try {
    const { topicId, questionText, options, correctAnswer, order } = req.body;
    const question = await Question.create({ topicId, questionText, options, correctAnswer, order });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/questions/:id', adminProtect, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:topicId/result', protect, async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      studentId: req.user.id,
      topicId: req.params.topicId
    }).sort({ createdAt: -1 });
    if (!attempt) return res.status(404).json({ message: 'No attempt found' });
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:topicId/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body;
    const questions = await Question.find({ topicId: req.params.topicId }).sort({ order: 1 });
    if (!questions.length) return res.status(404).json({ message: 'No questions found for this topic' });

    let score = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) score++;
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = score >= Math.ceil(totalQuestions * 0.9);

    const attempt = await QuizAttempt.create({
      studentId: req.user.id,
      topicId: req.params.topicId,
      answers, score, totalQuestions, passed
    });

    // Send email to student
    const student = await User.findById(req.user.id);
    const topic = await Topic.findById(req.params.topicId);

  if (student && topic) {
  // Always send email to student
  await sendQuizResultEmail(
    student.email,
    student.fullName,
    topic.title,
    score,
    totalQuestions,
    percentage,
    passed
  );

  // Only notify DSA if student passed with 90%+
  if (passed) {
    await sendQuizResultEmail(
      process.env.DSA_EMAIL,
      'DSA Office',
      topic.title,
      score,
      totalQuestions,
      percentage,
      passed
    );
  }
}

    res.status(201).json({ score, totalQuestions, passed, percentage, attempt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:topicId', protect, async (req, res) => {
  try {
    const questions = await Question.find({ topicId: req.params.topicId }).sort({ order: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;