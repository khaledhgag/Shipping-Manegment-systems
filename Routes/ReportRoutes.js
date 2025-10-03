// routes/ReportRoutes.js
const express = require('express');
const {
  getOrdersReport,
  getEmployeesReport,
  getDriversReport,
  getRevenueReport,
   getCustomersReport,
  getPendingPaymentsReport,
  getReturnedOrdersReport
} = require('../services/ReportService');
const { authMiddleware, requireRole } = require('../Midlleware/authMiddleware');

const router = express.Router();

router.get('/orders', authMiddleware, requireRole(['admin']), getOrdersReport);
router.get('/employees', authMiddleware, requireRole(['admin']), getEmployeesReport);
router.get('/drivers', authMiddleware, requireRole(['admin']), getDriversReport);
router.get('/revenue', authMiddleware, requireRole(['admin']), getRevenueReport);
router.get('/customers', authMiddleware, requireRole(['admin']), getCustomersReport);
router.get('/pending-payments', authMiddleware, requireRole(['admin']), getPendingPaymentsReport);
router.get('/returned-orders', authMiddleware, requireRole(['admin']), getReturnedOrdersReport);
module.exports = router;
