const { Booking, Service, Staff } = require('../model/models');

// Helper: generate time slots between start and end with break exclusion
const generateTimeSlots = (workingStart, workingEnd, lunchStart, lunchEnd, duration, bookedSlots) => {
  const slots = [];
  let current = workingStart;
  const endHour = workingEnd;

  while (current + duration <= endHour) {
    // Format current time as "HH:MM"
    const startHour = Math.floor(current);
    const startMin = Math.round((current - startHour) * 60);
    const timeStr = `${String(startHour).padStart(2,'0')}:${String(startMin).padStart(2,'0')}`;
    
    // Check lunch break
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
    
    // Check if already booked
    const isBooked = bookedSlots.some(slot => slot.startTime === timeStr);
    if (!isBooked) {
      slots.push(timeStr);
    }
    current += duration;
    // round to nearest 0.0? keep as float
    current = Math.round(current * 4) / 4;
  }
  return slots;
};

// @desc    Get available time slots for a staff member on a given date
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

  // Check if staff works on that day of week
  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  if (staff.workingHours.daysOff.includes(dayName)) {
    return res.json({ slots: [] });
  }

  // Parse working hours
  const workStart = parseFloat(staff.workingHours.start.replace(':', '.'));
  const workEnd = parseFloat(staff.workingHours.end.replace(':', '.'));
  let lunchStart = staff.workingHours.lunchStart ? parseFloat(staff.workingHours.lunchStart.replace(':', '.')) : null;
  let lunchEnd = staff.workingHours.lunchEnd ? parseFloat(staff.workingHours.lunchEnd.replace(':', '.')) : null;

  const duration = service.durationMinutes / 60; // convert to hours

  // Fetch existing bookings for that staff on that date
  const bookings = await Booking.find({
    staffId,
    date,
    status: { $in: ['pending', 'confirmed'] }
  }).select('startTime');

  const bookedSlots = bookings.map(b => ({ startTime: b.startTime }));

  const slots = generateTimeSlots(workStart, workEnd, lunchStart, lunchEnd, duration, bookedSlots);
  res.json({ slots });
};

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (customer)
const createBooking = async (req, res) => {
  const { serviceId, staffId, date, startTime } = req.body;
  const customerId = req.user.id;

  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  // Calculate endTime
  const [startHour, startMin] = startTime.split(':').map(Number);
  const endDate = new Date(0,0,0, startHour, startMin + service.durationMinutes);
  const endTime = `${String(endDate.getHours()).padStart(2,'0')}:${String(endDate.getMinutes()).padStart(2,'0')}`;

  // Check double-booking (will be caught by unique index anyway)
  const existing = await Booking.findOne({ staffId, date, startTime, status: { $ne: 'cancelled' } });
  if (existing) {
    return res.status(400).json({ message: 'Time slot already taken' });
  }

  const booking = new Booking({
    customerId,
    serviceId,
    staffId,
    date,
    startTime,
    endTime,
    status: 'pending'
  });

  const created = await booking.save();
  res.status(201).json(created);
};

// @desc    Get logged-in customer's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ customerId: req.user.id })
    .populate('serviceId')
    .populate('staffId');
  res.json(bookings);
};

// @desc    Cancel a booking (customer)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  if (booking.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Already cancelled' });
  }
  booking.status = 'cancelled';
  await booking.save();
  res.json({ message: 'Booking cancelled', booking });
};

// ----- Admin only -----

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  const { status, date } = req.query;
  let filter = {};
  if (status) filter.status = status;
  if (date) filter.date = date;

  const bookings = await Booking.find(filter)
    .populate('customerId', 'name email phone')
    .populate('serviceId')
    .populate('staffId');
  res.json(bookings);
};

// @desc    Update booking status (admin)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
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
};

module.exports = {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
};