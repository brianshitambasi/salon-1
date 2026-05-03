const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getReviews,
  getReviewById,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

router.get('/stats/average', getReviewStats);
router.route('/')
  .get(getReviews)
  .post(protect, createReview);

router.route('/:id')
  .get(getReviewById)
  .put(protect, updateReview)
  .delete(protect, adminOnly, deleteReview);

module.exports = router;