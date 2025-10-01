// Routes/DriverRoutes.js
const express = require('express');
const { 
  createDriver, 
  getDrivers, 
  updateDriverStatus, 
  getDriver, 
  updateDriver, 
  deleteDriver 
} = require('../services/DriveService');

const { authMiddleware, requireRole } = require('../Midlleware/authMiddleware');
const Driver = require('../models/DriverModel');
const router = express.Router();

// جميع المسارات تتطلب المصادقة والأدوار المناسبة
router.post('/', authMiddleware, requireRole(['admin']), createDriver);
router.get('/', authMiddleware, requireRole(['admin', 'employee']), getDrivers);
router.get('/all', authMiddleware, requireRole(['employee', 'admin']), async (req, res) => {
  try {
    // هيجيب كل السواقين بالاسم والحالة
    const drivers = await Driver.find().select('name availability');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', authMiddleware, requireRole(['admin', 'employee']), getDriver);
router.put('/:id', authMiddleware, requireRole(['admin']), updateDriver);
router.put('/:id/status', authMiddleware, requireRole(['admin', 'employee']), updateDriverStatus);
router.delete('/:id', authMiddleware, requireRole(['admin']), deleteDriver);

module.exports = router;