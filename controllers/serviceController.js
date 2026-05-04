const { Service } = require('../model/models');

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
const getServicesByCategory = async (req, res) => {
  try {
    const services = await Service.find({ category: req.params.category, isActive: true });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get popular services
// @route   GET /api/services/popular/all
// @access  Public
const getPopularServices = async (req, res) => {
  try {
    const services = await Service.find({ popular: true, isActive: true }).limit(6);
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----- Admin only -----

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { 
      name, description, price, durationMinutes, 
      imageUrl, category, tags, popular, discount, 
      benefits, beforeImage, afterImage 
    } = req.body;
    
    const service = new Service({ 
      name, description, price, durationMinutes,
      imageUrl, category, tags, popular, discount,
      benefits, beforeImage, afterImage
    });
    
    const created = await service.save();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Update all fields
    service.name = req.body.name || service.name;
    service.description = req.body.description || service.description;
    service.price = req.body.price || service.price;
    service.durationMinutes = req.body.durationMinutes || service.durationMinutes;
    service.imageUrl = req.body.imageUrl || service.imageUrl;
    service.category = req.body.category || service.category;
    service.tags = req.body.tags || service.tags;
    service.popular = req.body.popular !== undefined ? req.body.popular : service.popular;
    service.discount = req.body.discount !== undefined ? req.body.discount : service.discount;
    service.benefits = req.body.benefits || service.benefits;
    service.beforeImage = req.body.beforeImage || service.beforeImage;
    service.afterImage = req.body.afterImage || service.afterImage;
    service.isActive = req.body.isActive !== undefined ? req.body.isActive : service.isActive;
    
    const updated = await service.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  getServicesByCategory,
  getPopularServices,
  createService,
  updateService,
  deleteService
};