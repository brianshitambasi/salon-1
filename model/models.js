// models.js - One file to rule them all
const mongoose = require('mongoose');

// ------------------- User -------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: true });

// ------------------- Service -------------------
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  durationMinutes: { type: Number, required: true, min: 5 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ------------------- Staff -------------------
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String },
  imageUrl: { type: String },
  serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  workingHours: {
    start: { type: String, required: true },   // "09:00"
    end: { type: String, required: true },     // "18:00"
    lunchStart: { type: String },              // "13:00"
    lunchEnd: { type: String },                // "14:00"
    daysOff: { type: [String], default: [] }   // ["Sunday", "Monday"]
  }
}, { timestamps: true });

// ------------------- Booking -------------------
const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: String, required: true },        // "YYYY-MM-DD"
  startTime: { type: String, required: true },   // "HH:MM"
  endTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
}, { timestamps: true });

// Prevent double-booking same staff at same time
bookingSchema.index({ staffId: 1, date: 1, startTime: 1 }, { unique: true });

// ------------------- Export -------------------
module.exports = {
  User: mongoose.model('User', userSchema),
  Service: mongoose.model('Service', serviceSchema),
  Staff: mongoose.model('Staff', staffSchema),
  Booking: mongoose.model('Booking', bookingSchema),
};