// DriverService.js
const Driver = require('../models/DriverModel');

exports.createDriver = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json({ message: 'Driver created', driver });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDriverStatus = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    
    driver.availability = req.body.availability;
    await driver.save();
    
    res.json({ message: 'Driver status updated', driver });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// الحصول على سائق واحد
exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تحديث بيانات سائق
exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'Driver updated', driver });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// حذف سائق
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
