const express = require('express');
const { 
  getServices, 
  getServiceById, 
  getServicesByCategory,
  getPopularServices,
  createService, 
  updateService, 
  deleteService 
} = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/popular', getPopularServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', getServiceById);

// Admin only routes
router.post('/', protect, adminOnly, createService);
router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;