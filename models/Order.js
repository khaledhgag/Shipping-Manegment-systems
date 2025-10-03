// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    unique: true, 
    default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  // Customer who brings the order
  senderCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
     
  },
  // Original customer fields for backward compatibility
  customerName: { type: String },
  customerPhone: { type: String },
  // Customer who receives the order
  receiverName: {
    type: String,
    required: true
  },
  receiverPhone: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  productDetails: {
    type: String
  },
  pieces: {
    type: Number,
    default: 1
  },
  weight: {
    type: Number
  },
  // Pricing fields
  productPrice: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: true
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-transit', 'delivered', 'paid', 'cancelled', 'returned'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  returnReason: {
    type: String
  },
  // Refund fields
  refundStatus: {
    type: String,
    enum: ['none', 'partial', 'full'],
    default: 'none'
  },
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundNotes: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  // Accrual state to control balance adjustments
  accrualStatus: {
    type: String,
    enum: ['pending', 'accrued', 'reversed'],
    default: 'pending'
  },
  // Sender payout fields (to pay shipping customer)
  senderPayoutStatus: {
    type: String,
    enum: ['none', 'pending', 'paid'],
    default: 'none'
  },
  senderPayoutAmount: {
    type: Number,
    default: 0
  },
  senderPayoutAt: {
    type: Date
  },
  // Whether a returned order has been handed back/settled with the customer
  returnSettled: {
    type: Boolean,
    default: false
  },
  tracking: [{
    status: {
      type: String,
      required: true
    },
    location: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);