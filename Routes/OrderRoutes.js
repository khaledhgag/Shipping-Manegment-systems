const express = require('express');
const {
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getOrders,
  assignDriver,
  addTrackingUpdate,
  getOrderById
} = require('../services/OrderService');

const { authMiddleware, requireRole } = require('../Midlleware/authMiddleware');

const router = express.Router();

// إنشاء أوردر جديد
router.post('/', authMiddleware, requireRole(['employee', 'admin']), createOrder);

// تحديث شامل للأوردر
router.put('/:id', authMiddleware, requireRole(['employee', 'admin']), updateOrder);

// تحديث حالة الشحن
router.put('/:id/status', authMiddleware, requireRole(['employee', 'admin']), updateOrderStatus);

// تحديث حالة الدفع
router.put('/:id/payment', authMiddleware, requireRole(['employee', 'admin']), updatePaymentStatus);

// إسناد سائق
router.put('/:id/assign', authMiddleware, requireRole(['employee', 'admin']), assignDriver);

// جلب تفاصيل أوردر
router.get('/:id', authMiddleware, requireRole(['employee', 'admin']), getOrderById);

// جلب كل الأوردرز مع فلترة
router.get('/', authMiddleware, requireRole(['admin']), getOrders);

// إضافة تحديث تتبع
router.post('/:id/tracking', authMiddleware, requireRole(['employee', 'admin']), addTrackingUpdate);

module.exports = router;