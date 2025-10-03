// routes/CustomerRoutes.js
const express = require('express');
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
  getCustomerStats,
  getCustomerWithOrders,
  linkOrdersToCustomers,
  payoutCustomer
} = require('../services/CustomerServices');
const { authMiddleware, requireRole } = require('../Midlleware/authMiddleware');

const router = express.Router();

// Create a new customer
router.post('/', authMiddleware, requireRole(['employee', 'admin']), createCustomer);

// Get all customers
router.get('/', authMiddleware, requireRole(['employee', 'admin']), getCustomers);

// Get customer statistics
router.get('/stats', authMiddleware, requireRole(['admin']), getCustomerStats);

// Get customer by ID
router.get('/:id', authMiddleware, requireRole(['employee', 'admin']), getCustomerById);

// Get customer with orders
router.get('/:id/details', authMiddleware, requireRole(['employee', 'admin']), getCustomerWithOrders);

// Get customer orders
router.get('/:id/orders', authMiddleware, requireRole(['employee', 'admin']), getCustomerOrders);

// Update customer
router.put('/:id', authMiddleware, requireRole(['employee', 'admin']), updateCustomer);
router.post('/link-orders', authMiddleware, requireRole(['admin']), linkOrdersToCustomers);
router.post('/:id/payout', authMiddleware, requireRole(['admin']), payoutCustomer);
// Delete customer
router.delete('/:id', authMiddleware, requireRole(['admin']), deleteCustomer);

module.exports = router;