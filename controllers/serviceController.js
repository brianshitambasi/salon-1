const { Service } = require('../model/models');

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  const services = await Service.find({ isActive: true });
  res.json(services);
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (service) {
    res.json(service);
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
};

// ----- Admin only -----

// @desc    Create a service
// @route   POST /api/admin/services
// @access  Private/Admin
const createService = async (req, res) => {
  const { name, description, price, durationMinutes } = req.body;
  const service = new Service({ name, description, price, durationMinutes });
  const created = await service.save();
  res.status(201).json(created);
};

// @desc    Update a service
// @route   PUT /api/admin/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (service) {
    service.name = req.body.name || service.name;
    service.description = req.body.description || service.description;
    service.price = req.body.price || service.price;
    service.durationMinutes = req.body.durationMinutes || service.durationMinutes;
    service.isActive = req.body.isActive !== undefined ? req.body.isActive : service.isActive;
    const updated = await service.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
};

// @desc    Delete a service
// @route   DELETE /api/admin/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (service) {
    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};