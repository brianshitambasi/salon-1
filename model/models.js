// models.js - Complete file with all schemas
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

// ------------------- Staff (Enhanced) -------------------
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String },
  imageUrl: { type: String },
  videoUrl: { type: String },
  experience: { type: Number, default: 0 },
  serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  workingHours: {
    start: { type: String, required: true },
    end: { type: String, required: true },
    lunchStart: { type: String },
    lunchEnd: { type: String },
    daysOff: { type: [String], default: [] }
  },
  socialLinks: {
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String }
  }
}, { timestamps: true });

// ------------------- Booking -------------------
const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
}, { timestamps: true });

bookingSchema.index({ staffId: 1, date: 1, startTime: 1 }, { unique: true });

// ------------------- Gallery (with Comments) -------------------
const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['style', 'event', 'salon', 'staff'], default: 'style' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// ------------------- Review (NEW) -------------------
const reviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

// ------------------- Salon Info (NEW) -------------------
const salonInfoSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Salon Bliss' },
  description: { type: String },
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, default: -1.286389 },
    lng: { type: Number, default: 36.817223 }
  },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  workingHours: {
    monday: { type: String, default: '9:00 AM - 8:00 PM' },
    tuesday: { type: String, default: '9:00 AM - 8:00 PM' },
    wednesday: { type: String, default: '9:00 AM - 8:00 PM' },
    thursday: { type: String, default: '9:00 AM - 8:00 PM' },
    friday: { type: String, default: '9:00 AM - 8:00 PM' },
    saturday: { type: String, default: '9:00 AM - 8:00 PM' },
    sunday: { type: String, default: '10:00 AM - 6:00 PM' }
  },
  socialMedia: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String }
  },
  logo: { type: String },
  featuredImage: { type: String },
  servicesImage: { type: String }
}, { timestamps: true });

// ------------------- Export -------------------
module.exports = {
  User: mongoose.model('User', userSchema),
  Service: mongoose.model('Service', serviceSchema),
  Staff: mongoose.model('Staff', staffSchema),
  Booking: mongoose.model('Booking', bookingSchema),
  Gallery: mongoose.model('Gallery', gallerySchema),
  Review: mongoose.model('Review', reviewSchema),
  SalonInfo: mongoose.model('SalonInfo', salonInfoSchema),
};