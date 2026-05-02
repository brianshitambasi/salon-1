const express = require('express');
const { getServices, getServiceById, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin routes
router.post('/', protect, adminOnly, createService);
router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;