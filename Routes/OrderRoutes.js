// تحديث OrderRoutes.js
const express = require('express');
const { createOrder, updateOrderStatus, getOrders, assignDriver,addTrackingUpdate } = require('../services/OrderService');
const { authMiddleware, requireRole } = require('../Midlleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, requireRole(['employee', 'admin']), createOrder);
router.put('/:id/status', authMiddleware, requireRole(['employee', 'admin']), updateOrderStatus);
router.put('/:id/assign', authMiddleware, requireRole(['employee', 'admin']), assignDriver);
router.get('/', authMiddleware, requireRole(['admin']), getOrders);
// routes/OrderRoutes.js
router.post('/:id/tracking', authMiddleware, requireRole(['employee', 'admin']), addTrackingUpdate);
module.exports = router;