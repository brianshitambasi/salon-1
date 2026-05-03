const express = require('express');
const { getStaff, getStaffById, getStaffByService, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', getStaff);
router.get('/service/:serviceId', getStaffByService);
router.get('/:id', getStaffById);

router.post('/', protect, adminOnly, createStaff);
router.put('/:id', protect, adminOnly, updateStaff);
router.delete('/:id', protect, adminOnly, deleteStaff);

module.exports = router;