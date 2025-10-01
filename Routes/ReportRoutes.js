// routes/ReportRoutes.js
const express = require('express');
const {
  getOrdersReport,
  getEmployeesReport,
  getDriversReport,
  getRevenueReport
} = require('../services/ReportService');
const { authMiddleware, requireRole } = require('../Midlleware/authMiddleware');

const router = express.Router();

router.get('/orders', authMiddleware, requireRole(['admin']), getOrdersReport);
router.get('/employees', authMiddleware, requireRole(['admin']), getEmployeesReport);
router.get('/drivers', authMiddleware, requireRole(['admin']), getDriversReport);
router.get('/revenue', authMiddleware, requireRole(['admin']), getRevenueReport);

module.exports = router;
