const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  price: { type: Number, required: true },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-transit', 'delivered', 'paid'],
    default: 'pending'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
