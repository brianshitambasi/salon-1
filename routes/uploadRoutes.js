const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { imageUpload, videoUpload, uploadImage, uploadVideo } = require('../controllers/uploadController');

router.post('/image', protect, adminOnly, imageUpload.single('image'), uploadImage);
router.post('/video', protect, adminOnly, videoUpload.single('video'), uploadVideo);

module.exports = router;
