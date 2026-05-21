const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { protect, adminProtect } = require('../middleware/auth');

router.get('/:topicId', protect, async (req, res) => {
  try {
    const videos = await Video.find({ topicId: req.params.topicId });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', adminProtect, async (req, res) => {
  try {
    const { topicId, title, videoUrl, duration } = req.body;
    const video = await Video.create({ topicId, title, videoUrl, duration });
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', adminProtect, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', adminProtect, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;