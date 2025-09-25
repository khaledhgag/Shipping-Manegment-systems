// DriverRoutes.js
const express = require('express');
const { createDriver, getDrivers, updateDriverStatus } = require('../services/DriverService');
const { authMiddleware, requireRole } = require('../Midlleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, requireRole(['admin']), createDriver);
router.get('/', authMiddleware, requireRole(['admin', 'employee']), getDrivers);
router.put('/:id/status', authMiddleware, requireRole(['admin', 'employee']), updateDriverStatus);

module.exports = router;