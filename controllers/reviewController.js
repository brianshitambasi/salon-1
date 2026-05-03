const { Review } = require('../model/models');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .populate('customerId', 'name email')
      .populate('serviceId', 'name')
      .populate('staffId', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('serviceId', 'name')
      .populate('staffId', 'name');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get review statistics
// @route   GET /api/reviews/stats/average
// @access  Public
const getReviewStats = async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { isApproved: true } },
      { $group: { 
        _id: null, 
        average: { $avg: '$rating' }, 
        total: { $sum: 1 },
        fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
      } }
    ]);
    res.json({ 
      average: result[0]?.average || 0, 
      total: result[0]?.total || 0,
      distribution: {
        5: result[0]?.fiveStar || 0,
        4: result[0]?.fourStar || 0,
        3: result[0]?.threeStar || 0,
        2: result[0]?.twoStar || 0,
        1: result[0]?.oneStar || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { rating, comment, serviceId, staffId } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const review = new Review({
      customerId: req.user.id,
      rating,
      comment,
      serviceId,
      staffId
    });
    await review.save();
    const populatedReview = await Review.findById(review._id).populate('customerId', 'name');
    res.status(201).json(populatedReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (owner only)
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getReviews,
  getReviewById,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview
};