const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  markAsRead,
  getUnreadCount
} = require('../controllers/bookingController');

// Public routes
router.post('/available-slots', getAvailableSlots);
router.post('/', createBooking);
router.post('/my', getMyBookings);
router.post('/cancel', cancelBooking);

// Admin only routes
router.get('/admin/all', protect, adminOnly, getAllBookings);
router.put('/admin/:id/status', protect, adminOnly, updateBookingStatus);
router.put('/admin/:id/read', protect, adminOnly, markAsRead);
router.get('/admin/unread/count', protect, adminOnly, getUnreadCount);

module.exports = router;