const { Staff } = require('../model/models');

// @desc    Get all staff (with populated services)
// @route   GET /api/staff
// @access  Public
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().populate('serviceIds');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single staff by ID
// @route   GET /api/staff/:id
// @access  Public
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('serviceIds');
    if (staff) {
      res.json(staff);
    } else {
      res.status(404).json({ message: 'Staff not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get staff by service
// @route   GET /api/staff/service/:serviceId
// @access  Public
const getStaffByService = async (req, res) => {
  try {
    const staff = await Staff.find({ 
      serviceIds: req.params.serviceId
    }).populate('serviceIds');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----- Admin only -----

// @desc    Create a staff member
// @route   POST /api/staff
// @access  Private/Admin
const createStaff = async (req, res) => {
  try {
    const { name, role, bio, imageUrl, videoUrl, experience, serviceIds, workingHours, socialLinks } = req.body;
    const staff = new Staff({ 
      name, role, bio, imageUrl, videoUrl, experience, serviceIds, workingHours, socialLinks 
    });
    const created = await staff.save();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a staff member
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (staff) {
      staff.name = req.body.name || staff.name;
      staff.role = req.body.role || staff.role;
      staff.bio = req.body.bio || staff.bio;
      staff.imageUrl = req.body.imageUrl || staff.imageUrl;
      staff.videoUrl = req.body.videoUrl || staff.videoUrl;
      staff.experience = req.body.experience || staff.experience;
      staff.serviceIds = req.body.serviceIds || staff.serviceIds;
      staff.workingHours = req.body.workingHours || staff.workingHours;
      staff.socialLinks = req.body.socialLinks || staff.socialLinks;
      const updated = await staff.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Staff not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a staff member
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (staff) {
      await staff.deleteOne();
      res.json({ message: 'Staff removed' });
    } else {
      res.status(404).json({ message: 'Staff not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStaff,
  getStaffById,
  getStaffByService,
  createStaff,
  updateStaff,
  deleteStaff
};