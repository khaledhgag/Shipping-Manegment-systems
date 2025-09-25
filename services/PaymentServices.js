// services/PaymentService.js
const Payment = require('../models/PaymentModel');

exports.createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json({ message: 'Payment created', payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    
    payment.status = req.body.status;
    payment.transactionId = req.body.transactionId;
    await payment.save();
    
    res.json({ message: 'Payment status updated', payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('order');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};