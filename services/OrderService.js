const Order = require('../models/Order');
const Driver = require('../models/DriverModel');

// ✅ دالة مساعدة لتحديث حالة السائق
const updateDriverStatus = async (driverId, status) => {
  await Driver.findByIdAndUpdate(driverId, { availability: status });
};

// إنشاء أوردر جديد
exports.createOrder = async (req, res) => {
  try {
    const { driverId, ...orderData } = req.body;

    // ✅ عمل instance جديدة من Order
    const order = new Order({
      ...orderData,
      createdBy: req.user._id // دايماً نسجل مين عمل الأوردر
    });

    // ✅ لو الأوردر اتعمل مع تعيين سواق
    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      order.assignedDriver = driverId;
      order.status = 'assigned';

      // تحديث حالة السواق -> busy
      await updateDriverStatus(driverId, 'busy');
    }

    // ✅ الحتة دي هتشغل pre('save') وتولّد orderNumber تلقائي
    await order.save();

    res.status(201).json({ 
      message: 'Order created successfully', 
      order 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// ✅ تحديث شامل للطلب
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const { driverId, ...updateData } = req.body;
    
    // تحديث البيانات الأساسية
    Object.assign(order, updateData);
    
    // التعامل مع تغيير السائق
    if (driverId && driverId !== order.assignedDriver?.toString()) {
      const driver = await Driver.findById(driverId);
      if (!driver || driver.availability !== 'available') {
        return res.status(400).json({ error: 'New driver not available' });
      }
      
      // تحرير السائق القديم
      if (order.assignedDriver) {
        await updateDriverStatus(order.assignedDriver, 'available');
      }
      
      order.assignedDriver = driverId;
      order.status = 'assigned';
      await updateDriverStatus(driverId, 'busy');
    }

    await order.save();
    res.json({ message: 'Order updated', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// تحديث حالة الشحن فقط
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = req.body.status;
    
    // ✅ إضافة تحديث تلقائي للتتبع
    order.tracking.push({
      status: req.body.status,
      location: req.body.location || 'System',
      notes: req.body.notes || 'Status updated'
    });

    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ تحديث حالة الدفع
exports.updatePaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.paymentStatus = req.body.paymentStatus;
    
    // تحديث الحالة العامة إذا تم الدفع
    if (req.body.paymentStatus === 'paid' && order.status === 'delivered') {
      order.status = 'paid';
    }

    await order.save();
    res.json({ message: 'Payment status updated', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// عرض كل الأوردرز مع فلترة
exports.getOrders = async (req, res) => {
  try {
    const { status, driverId, date } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (driverId) filter.assignedDriver = driverId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const orders = await Order.find(filter)
      .populate('createdBy', 'name role')
      .populate('assignedDriver', 'name availability')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// إسناد سائق
exports.assignDriver = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const driver = await Driver.findById(req.body.driverId);
    if (!driver || driver.availability !== 'available') {
      return res.status(400).json({ error: 'Driver not available' });
    }

    // تحرير السائق القديم
    if (order.assignedDriver) {
      await updateDriverStatus(order.assignedDriver, 'available');
    }

    order.assignedDriver = driver._id;
    order.status = 'assigned';
    await order.save();
    await updateDriverStatus(driver._id, 'busy');

    res.json({ message: 'Driver assigned successfully', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// إضافة تحديث تتبع
exports.addTrackingUpdate = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.tracking.push({
      status: req.body.status,
      location: req.body.location,
      notes: req.body.notes,
      timestamp: new Date() // ✅ تصحيح اسم الحقل
    });

    await order.save();
    res.json({ message: 'Tracking update added', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// جلب تفاصيل أوردر معين
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('createdBy', 'name role')
      .populate('assignedDriver', 'name availability');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};