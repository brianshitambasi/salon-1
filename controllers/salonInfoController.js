const { SalonInfo } = require('../model/models');

// @desc    Get salon information
// @route   GET /api/salon-info
// @access  Public
const getSalonInfo = async (req, res) => {
  try {
    let info = await SalonInfo.findOne();
    if (!info) {
      info = new SalonInfo({
        name: 'Salon Bliss',
        address: '123 Salon Street, Nairobi, Kenya',
        phone: '+254 700 000 000',
        email: 'info@salonbliss.com'
      });
      await info.save();
    }
    res.json(info);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update salon information
// @route   PUT /api/salon-info
// @access  Private/Admin
const updateSalonInfo = async (req, res) => {
  try {
    let info = await SalonInfo.findOne();
    if (!info) {
      info = new SalonInfo();
    }
    info.name = req.body.name || info.name;
    info.description = req.body.description || info.description;
    info.address = req.body.address || info.address;
    if (req.body.coordinates) {
      info.coordinates = req.body.coordinates;
    }
    info.phone = req.body.phone || info.phone;
    info.email = req.body.email || info.email;
    if (req.body.workingHours) {
      info.workingHours = { ...info.workingHours, ...req.body.workingHours };
    }
    if (req.body.socialMedia) {
      info.socialMedia = { ...info.socialMedia, ...req.body.socialMedia };
    }
    info.logo = req.body.logo || info.logo;
    info.featuredImage = req.body.featuredImage || info.featuredImage;
    info.servicesImage = req.body.servicesImage || info.servicesImage;
    await info.save();
    res.json(info);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get salon working hours
// @route   GET /api/salon-info/hours
// @access  Public
const getWorkingHours = async (req, res) => {
  try {
    const info = await SalonInfo.findOne();
    if (!info) {
      return res.json({
        monday: '9:00 AM - 8:00 PM',
        tuesday: '9:00 AM - 8:00 PM',
        wednesday: '9:00 AM - 8:00 PM',
        thursday: '9:00 AM - 8:00 PM',
        friday: '9:00 AM - 8:00 PM',
        saturday: '9:00 AM - 8:00 PM',
        sunday: '10:00 AM - 6:00 PM'
      });
    }
    res.json(info.workingHours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSalonInfo,
  updateSalonInfo,
  getWorkingHours
};