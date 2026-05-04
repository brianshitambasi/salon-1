const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getGalleryPosts,
  getGalleryPostById,
  createGalleryPost,
  updateGalleryPost,
  deleteGalleryPost,
  toggleLike,
  addComment,
  deleteComment,
  addRating
} = require('../controllers/galleryController');

// Public routes
router.get('/', getGalleryPosts);
router.get('/:id', getGalleryPostById);

// Admin only routes
router.post('/', protect, adminOnly, createGalleryPost);
router.put('/:id', protect, adminOnly, updateGalleryPost);
router.delete('/:id', protect, adminOnly, deleteGalleryPost);

// Authenticated user routes
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);
router.post('/:id/ratings', protect, addRating);

module.exports = router;