const { Staff } = require('../model/models');

// @desc    Get all staff (with populated services)
// @route   GET /api/staff
// @access  Public
const getStaff = async (req, res) => {
  const staff = await Staff.find().populate('serviceIds');
  res.json(staff);
};

// @desc    Get single staff by ID
// @route   GET /api/staff/:id
// @access  Public
const getStaffById = async (req, res) => {
  const staff = await Staff.findById(req.params.id).populate('serviceIds');
  if (staff) {
    res.json(staff);
  } else {
    res.status(404).json({ message: 'Staff not found' });
  }
};

// ----- Admin only -----

// @desc    Create a staff member
// @route   POST /api/admin/staff
// @access  Private/Admin
const createStaff = async (req, res) => {
  const { name, role, bio, imageUrl, serviceIds, workingHours } = req.body;
  const staff = new Staff({ name, role, bio, imageUrl, serviceIds, workingHours });
  const created = await staff.save();
  res.status(201).json(created);
};

// @desc    Update a staff member
// @route   PUT /api/admin/staff/:id
// @access  Private/Admin
const updateStaff = async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  if (staff) {
    staff.name = req.body.name || staff.name;
    staff.role = req.body.role || staff.role;
    staff.bio = req.body.bio || staff.bio;
    staff.imageUrl = req.body.imageUrl || staff.imageUrl;
    staff.serviceIds = req.body.serviceIds || staff.serviceIds;
    staff.workingHours = req.body.workingHours || staff.workingHours;
    const updated = await staff.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Staff not found' });
  }
};

// @desc    Delete a staff member
// @route   DELETE /api/admin/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  if (staff) {
    await staff.deleteOne();
    res.json({ message: 'Staff removed' });
  } else {
    res.status(404).json({ message: 'Staff not found' });
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};