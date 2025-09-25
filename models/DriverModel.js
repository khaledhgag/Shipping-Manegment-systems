// models/Driver.js
const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  vehicle: {
    type: String, // مثال: "فيات 2018", "دراجة نارية"
    trim: true
  },
  availability: { type: String, enum: ['available', 'busy', 'off'], default: 'available' },

  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
