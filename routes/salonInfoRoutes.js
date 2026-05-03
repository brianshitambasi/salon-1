const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getSalonInfo,
  updateSalonInfo,
  getWorkingHours
} = require('../controllers/salonInfoController');

router.get('/hours', getWorkingHours);
router.route('/')
  .get(getSalonInfo)
  .put(protect, adminOnly, updateSalonInfo);

module.exports = router;