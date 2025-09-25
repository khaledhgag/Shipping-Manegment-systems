const Order = require('../models/Order');

// ✅ إنشاء أوردر جديد (الموظف أو الأدمن)
exports.createOrder = async (req, res) => {
  try {
    const order = new Order({ ...req.body, createdBy: req.user._id });
    await order.save();
    res.status(201).json({ message: 'Order created', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ تحديث حالة الأوردر
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = req.body.status;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ عرض كل الأوردرز
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('createdBy', 'name role');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// في OrderService.js أضف
exports.assignDriver = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const driver = await Driver.findById(req.body.driverId);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    
    if (driver.availability !== 'available') {
      return res.status(400).json({ error: 'Driver is not available' });
    }
    
    order.assignedDriver = driver._id;
    order.status = 'assigned';
    await order.save();
    
    // تحديث حالة السائق
    driver.availability = 'busy';
    await driver.save();
    
    res.json({ message: 'Driver assigned successfully', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};