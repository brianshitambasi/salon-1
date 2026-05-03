require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const staffRoutes = require('./routes/staffRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const salonInfoRoutes = require('./routes/salonInfoRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection with increased timeouts
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/salon-info', salonInfoRoutes);

// Test route
app.get('/', (req, res) => res.send('Salon API is running'));

// Seed admin (kept for convenience)
app.post('/seed-admin', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { User } = require('./model/models');
  try {
    const existing = await User.findOne({ email: 'admin@salon.com' });
    if (existing) return res.status(400).json({ msg: 'Admin already exists' });
    const hashed = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin',
      email: 'admin@salon.com',
      password: hashed,
      phone: '0000000000',
      role: 'admin'
    });
    await admin.save();
    res.json({ msg: 'Admin created: admin@salon.com / admin123' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));