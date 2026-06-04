const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Topic = require('../models/Topic');
const { protect, adminProtect } = require('../middleware/auth');

const CLOUDINARY_UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'cru-onboard/topic-images';
const dataImagePattern = /^data:image\/[a-zA-Z0-9.+-]+;base64,/;

const isCloudinaryConfigured = () => (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const signCloudinaryParams = (params) => {
  const stringToSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${stringToSign}${process.env.CLOUDINARY_API_SECRET}`)
    .digest('hex');
};

const uploadImageToCloudinary = async (imageData) => {
  if (!imageData) return '';
  if (!dataImagePattern.test(imageData)) return imageData;

  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to the server environment.');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const uploadParams = {
    folder: CLOUDINARY_UPLOAD_FOLDER,
    timestamp
  };

  const formData = new FormData();
  formData.append('file', imageData);
  formData.append('api_key', process.env.CLOUDINARY_API_KEY);
  formData.append('folder', CLOUDINARY_UPLOAD_FOLDER);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signCloudinaryParams(uploadParams));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error?.message || 'Cloudinary upload failed');
  }

  return result.secure_url || result.url || '';
};

const sanitizeResourceLinks = (resourceLinks) => (
  Array.isArray(resourceLinks)
    ? resourceLinks
        .map((link) => ({
          url: link?.url?.trim(),
          description: link?.description?.trim()
        }))
        .filter((link) => link.url && link.description)
    : []
);

const sanitizeImageItems = (items) => (
  Array.isArray(items)
    ? items
        .map((item) => ({
          image: item?.image?.trim(),
          description: item?.description?.trim()
        }))
        .filter((item) => item.image && item.description)
    : []
);

const uploadImageItems = async (items) => (
  Promise.all(
    sanitizeImageItems(items).map(async (item) => ({
      image: await uploadImageToCloudinary(item.image),
      description: item.description
    }))
  )
);

const buildTopicPayload = async (body) => {
  const dressCodeGuide = body.dressCodeGuide || {};
  const legacyDoItems = dressCodeGuide.doImage
    ? [{ image: dressCodeGuide.doImage, description: dressCodeGuide.doDescription || 'Acceptable dress code example.' }]
    : [];
  const legacyDontItems = dressCodeGuide.dontImage
    ? [{ image: dressCodeGuide.dontImage, description: dressCodeGuide.dontDescription || 'Dress code example to avoid.' }]
    : [];

  const [doItems, dontItems, topicImages] = await Promise.all([
    uploadImageItems(dressCodeGuide.doItems?.length ? dressCodeGuide.doItems : legacyDoItems),
    uploadImageItems(dressCodeGuide.dontItems?.length ? dressCodeGuide.dontItems : legacyDontItems),
    uploadImageItems(body.topicImages)
  ]);

  return {
    title: body.title,
    description: body.description,
    content: body.content,
    order: body.order,
    isPublished: body.isPublished,
    category: body.category,
    dressCodeGuide: {
      doImage: doItems[0]?.image || '',
      dontImage: dontItems[0]?.image || '',
      doItems,
      dontItems
    },
    topicImages,
    resourceLinks: sanitizeResourceLinks(body.resourceLinks)
  };
};

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
    const payload = await buildTopicPayload(req.body);
    const topic = await Topic.create(payload);
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/topics/:id
// @desc    Update a topic (admin only)
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const payload = await buildTopicPayload(req.body);
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      payload,
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
