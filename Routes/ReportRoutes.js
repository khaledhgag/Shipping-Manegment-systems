// routes/ReportRoutes.js
const express = require('express');
const { getOrdersReport, getDriversPerformance, getRevenueReport } = require('../services/ReportService');
const { authMiddleware, requireRole } = require('../Midlleware/authMiddleware');

const router = express.Router();

router.get('/orders', authMiddleware, requireRole(['admin']), getOrdersReport);
router.get('/drivers-performance', authMiddleware, requireRole(['admin']), getDriversPerformance);
router.get('/revenue', authMiddleware, requireRole(['admin']), getRevenueReport);

module.exports = router;