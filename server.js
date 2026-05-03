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

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('âœ… MongoDB connected');
    
    // Initialize default data
    const { SalonInfo, Gallery, Review } = require('./model/models');
    
    // Create default salon info if not exists
    const info = await SalonInfo.findOne();
    if (!info) {
      const defaultInfo = new SalonInfo({
        name: 'Salon Bliss',
        description: 'Premium salon services in Nairobi',
        address: '123 Salon Street, Nairobi, Kenya',
        phone: '+254 700 000 000',
        email: 'info@salonbliss.com',
        coordinates: { lat: -1.286389, lng: 36.817223 },
        workingHours: {
          monday: '9:00 AM - 8:00 PM',
          tuesday: '9:00 AM - 8:00 PM',
          wednesday: '9:00 AM - 8:00 PM',
          thursday: '9:00 AM - 8:00 PM',
          friday: '9:00 AM - 8:00 PM',
          saturday: '9:00 AM - 8:00 PM',
          sunday: '10:00 AM - 6:00 PM'
        }
      });
      await defaultInfo.save();
      console.log('âœ… Default salon info created');
    }
    
  } catch (err) {
    console.error('âŒ MongoDB connection error:', err.message);
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

// Seed admin
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
app.listen(PORT, () => console.log(`íº€ Server running on port ${PORT}`));

// Upload routes
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);
