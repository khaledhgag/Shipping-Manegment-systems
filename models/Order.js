const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    unique: true, 
    default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  productDetails: { type: String },
  pieces: { type: Number, default: 1 },
  weight: { type: Number },
  price: { type: Number, required: true },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-transit', 'delivered', 'paid', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  tracking: [{
    status: { type: String, required: true },
    location: { type: String },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });


// ✅ إضافة مُولّد تلقائي لرقم الطلب
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);