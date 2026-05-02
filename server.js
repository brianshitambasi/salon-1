require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const staffRoutes = require('./routes/staffRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/bookings', bookingRoutes);

// Test route
app.get('/', (req, res) => res.send('Salon API is running'));

// Optional seed admin (kept for convenience)
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));