const { Booking, Service, Staff } = require('../model/models');

// Helper: generate time slots
const generateTimeSlots = (workingStart, workingEnd, lunchStart, lunchEnd, duration, bookedSlots) => {
  const slots = [];
  let current = workingStart;
  const endHour = workingEnd;

  while (current + duration <= endHour) {
    const startHour = Math.floor(current);
    const startMin = Math.round((current - startHour) * 60);
    const timeStr = `${String(startHour).padStart(2,'0')}:${String(startMin).padStart(2,'0')}`;
    
    if (lunchStart && lunchEnd) {
      const lunchStartNum = lunchStart;
      const lunchEndNum = lunchEnd;
      if (current >= lunchStartNum && current + duration <= lunchEndNum) {
        current = lunchEndNum;
        continue;
      }
      if (current < lunchEndNum && current + duration > lunchStartNum) {
        current = lunchEndNum;
        continue;
      }
    }
    
    const isBooked = bookedSlots.some(slot => slot.startTime === timeStr);
    if (!isBooked) {
      slots.push(timeStr);
    }
    current += duration;
    current = Math.round(current * 4) / 4;
  }
  return slots;
};

// @desc    Get available time slots
// @route   POST /api/bookings/available-slots
// @access  Public
const getAvailableSlots = async (req, res) => {
  const { staffId, date, serviceId } = req.body;
  if (!staffId || !date || !serviceId) {
    return res.status(400).json({ message: 'staffId, date and serviceId required' });
  }

  const staff = await Staff.findById(staffId);
  if (!staff) {
    return res.status(404).json({ message: 'Staff not found' });
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  if (staff.workingHours.daysOff?.includes(dayName)) {
    return res.json({ slots: [] });
  }

  const workStart = parseFloat(staff.workingHours.start.replace(':', '.'));
  const workEnd = parseFloat(staff.workingHours.end.replace(':', '.'));
  let lunchStart = staff.workingHours.lunchStart ? parseFloat(staff.workingHours.lunchStart.replace(':', '.')) : null;
  let lunchEnd = staff.workingHours.lunchEnd ? parseFloat(staff.workingHours.lunchEnd.replace(':', '.')) : null;

  const duration = service.durationMinutes / 60;

  const bookings = await Booking.find({
    staffId,
    date,
    status: { $in: ['pending', 'confirmed'] }
  }).select('startTime');

  const bookedSlots = bookings.map(b => ({ startTime: b.startTime }));

  const slots = generateTimeSlots(workStart, workEnd, lunchStart, lunchEnd, duration, bookedSlots);
  res.json({ slots });
};

// @desc    Create a booking (Guest or Registered)
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
  try {
    const { 
      customerName, customerEmail, customerPhone,
      serviceId, staffId, date, startTime, notes 
    } = req.body;
    
    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ message: 'Please provide name, email and phone' });
    }
    
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const [startHour, startMin] = startTime.split(':').map(Number);
    const endDate = new Date(0, 0, 0, startHour, startMin + service.durationMinutes);
    const endTime = `${String(endDate.getHours()).padStart(2,'0')}:${String(endDate.getMinutes()).padStart(2,'0')}`;

    const existing = await Booking.findOne({ staffId, date, startTime, status: { $ne: 'cancelled' } });
    if (existing) {
      return res.status(400).json({ message: 'Time slot already taken' });
    }

    // Check if user is logged in (has customerId)
    const customerId = req.user?.id || null;
    
    const booking = new Booking({
      customerName,
      customerEmail,
      customerPhone,
      customerId,
      serviceId,
      staffId,
      date,
      startTime,
      endTime,
      status: 'pending',
      notes: notes || '',
      isRead: false
    });

    const created = await booking.save();
    
    // Populate for response
    await created.populate('serviceId', 'name price');
    await created.populate('staffId', 'name');
    
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get customer's bookings (by email + phone or logged in)
// @route   POST /api/bookings/my (POST with email/phone)
// @access  Public
const getMyBookings = async (req, res) => {
  try {
    let query = {};
    
    if (req.user) {
      // Logged in user
      query.customerId = req.user.id;
    } else if (req.body.email && req.body.phone) {
      // Guest using email and phone
      query.customerEmail = req.body.email;
      query.customerPhone = req.body.phone;
    } else {
      return res.status(400).json({ message: 'Please provide email and phone or login' });
    }
    
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('serviceId', 'name price')
      .populate('staffId', 'name');
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Cancel a booking (by email+phone or logged in)
// @route   POST /api/bookings/cancel (using email+phone)
// @access  Public
const cancelBooking = async (req, res) => {
  try {
    const { bookingId, email, phone } = req.body;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify ownership
    const isOwner = req.user?.id === booking.customerId?.toString() ||
                    (booking.customerEmail === email && booking.customerPhone === phone);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Already cancelled' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----- Admin only -----

// @desc    Get all bookings (admin)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const { status, date, isRead } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (date) filter.date = date;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'name price')
      .populate('staffId', 'name');
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update booking status (admin)
// @route   PUT /api/bookings/admin/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending','confirmed','cancelled','completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Mark booking as read (admin)
// @route   PUT /api/bookings/admin/:id/read
// @access  Private/Admin
const markAsRead = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    booking.isRead = true;
    await booking.save();
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get unread bookings count (for notification badge)
// @route   GET /api/bookings/admin/unread/count
// @access  Private/Admin
const getUnreadCount = async (req, res) => {
  try {
    const count = await Booking.countDocuments({ isRead: false, status: 'pending' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  markAsRead,
  getUnreadCount
};