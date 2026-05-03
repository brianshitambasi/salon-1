const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getGalleryPosts,
  getGalleryPostById,
  createGalleryPost,
  updateGalleryPost,
  deleteGalleryPost,
  toggleLike
} = require('../controllers/galleryController');

router.route('/')
  .get(getGalleryPosts)
  .post(protect, adminOnly, createGalleryPost);

router.route('/:id')
  .get(getGalleryPostById)
  .put(protect, adminOnly, updateGalleryPost)
  .delete(protect, adminOnly, deleteGalleryPost);

router.post('/:id/like', protect, toggleLike);

module.exports = router;