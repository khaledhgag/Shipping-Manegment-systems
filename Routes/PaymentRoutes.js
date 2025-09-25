// routes/PaymentRoutes.js
const express = require('express');
const { createPayment, updatePaymentStatus, getPayments } = require('../services/PaymentServices');
const { authMiddleware, requireRole } = require('../Midlleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, requireRole(['admin', 'employee']), createPayment);
router.put('/:id/status', authMiddleware, requireRole(['admin', 'employee']), updatePaymentStatus);
router.get('/', authMiddleware, requireRole(['admin']), getPayments);

module.exports = router;