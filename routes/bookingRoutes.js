const express = require('express');
const {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Customer routes
router.post('/available-slots', getAvailableSlots);
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllBookings);
router.put('/admin/:id/status', protect, adminOnly, updateBookingStatus);

module.exports = router;