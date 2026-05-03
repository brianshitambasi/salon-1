const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'salon-gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

// Configure storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'salon-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const imageUpload = multer({ storage: imageStorage });
const videoUpload = multer({ storage: videoStorage });

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
// @access  Private/Admin
const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ 
      imageUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Upload video to Cloudinary
// @route   POST /api/upload/video
// @access  Private/Admin
const uploadVideo = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ 
      videoUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  imageUpload,
  videoUpload,
  uploadImage,
  uploadVideo
};
