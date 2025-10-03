const Order = require('../models/Order');
const Driver = require('../models/DriverModel');
const Customer = require('../models/CustomerModel');

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
      senderCustomer: req.body.senderCustomer, // تأكد من إرسال هذا الحقل
      createdBy: req.user._id // دايماً نسجل مين عمل الأوردر
    });

    // حساب السعر الإجمالي من سعر المنتج وتكلفة الشحن إن وُجدت
    if (order.productPrice != null || order.shippingCost != null) {
      const product = Number(order.productPrice || 0);
      const shipping = Number(order.shippingCost || 0);
      order.price = product + shipping;
    }

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

  // تحديث رصيد العميل (نضيف قيمة الطلب لرصيده)
  if (order.senderCustomer) {
    await Customer.findByIdAndUpdate(order.senderCustomer, {
      $inc: { balance: Number(order.price || 0), totalOrders: 1, totalValue: Number(order.price || 0) }
    });
  }

    res.status(201).json({ 
      message: 'Order created successfully', 
      order 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// دفع للعميل صاحب الشحنة
exports.payoutToSender = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // لا يمكن الدفع إلا إذا كانت حالة الدفع paid أو حالة الطلب paid
    if (!(order.paymentStatus === 'paid' || order.status === 'paid')) {
      return res.status(400).json({ error: 'Payout allowed only after payment is received' });
    }

    const amount = Number(req.body.amount || 0);
    if (amount <= 0) return res.status(400).json({ error: 'Invalid payout amount' });

    // لا تدفع أكثر من السعر الإجمالي
    const maxPayable = Number(order.price || 0);
    const alreadyPaid = Number(order.senderPayoutAmount || 0);
    if (alreadyPaid + amount > maxPayable) {
      return res.status(400).json({ error: 'Payout exceeds order total' });
    }

    order.senderPayoutAmount = alreadyPaid + amount;
    order.senderPayoutStatus = order.senderPayoutAmount >= maxPayable ? 'paid' : 'pending';
    order.senderPayoutAt = new Date();

    await order.save();
    res.json({ message: 'Payout processed', order });
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
  const oldPrice = Number(order.price || 0);
  const wasCounted = !(order.status === 'returned' || order.status === 'cancelled');
  Object.assign(order, updateData);

    // حساب السعر الإجمالي من سعر المنتج وتكلفة الشحن إن وُجدت
    if (updateData.productPrice != null || updateData.shippingCost != null) {
      const product = Number(order.productPrice || 0);
      const shipping = Number(order.shippingCost || 0);
      order.price = product + shipping;
    }

  // لو السعر اتغير والحالة ليست مرتجع/ملغي، عدّل رصيد العميل بالفرق
  const newPrice = Number(order.price || 0);
  if (order.senderCustomer && wasCounted && oldPrice !== newPrice) {
    const delta = newPrice - oldPrice;
    if (delta !== 0) {
      await Customer.findByIdAndUpdate(order.senderCustomer, { $inc: { balance: delta, totalValue: delta } });
    }
  }
    
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

    // لو اتلغى الطلب أو ارتجع، لا يوجد استحقاق للعميل (المدفوعات تعتبر غير مستحقة)
    if (order.status === 'cancelled' || order.status === 'returned') {
    // خصم قيمة الطلب من رصيد العميل إذا كانت مُضافة من قبل
    const value = Number(order.price || 0);
    if (order.senderCustomer) {
      await Customer.findByIdAndUpdate(order.senderCustomer, { $inc: { balance: -value, returnedOrders: 1 } });
    }
  }

  // لو رجعت الحالة إلى delivered بعد فشل/إرجاع سابق، أعد إضافة القيمة
  if (req.body.status === 'delivered') {
    const value = Number(order.price || 0);
    if (order.senderCustomer) {
      await Customer.findByIdAndUpdate(order.senderCustomer, { $inc: { balance: value } });
    }
    }

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

    // في حالة فشل الدفع، نُرجع الطلب للعميل
    if (req.body.paymentStatus === 'failed') {
      order.status = 'returned';
      order.returnReason = order.returnReason || 'Payment failed';
      order.tracking.push({
        status: 'returned',
        location: 'System',
        notes: 'Auto return due to payment failure'
      });
    // خصم القيمة من رصيد العميل
    if (order.senderCustomer) {
      await Customer.findByIdAndUpdate(order.senderCustomer, { $inc: { balance: -Number(order.price || 0) } });
    }
    }

    await order.save();
    res.json({ message: 'Payment status updated', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// رد المبلغ للعميل (كلي/جزئي)
exports.refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const amount = Number(req.body.amount || 0);
    const notes = req.body.notes || '';

    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid refund amount' });
    }

    const maxRefundable = Number(order.price || 0);
    if (amount > maxRefundable) {
      return res.status(400).json({ error: 'Refund exceeds order total' });
    }

    order.refundedAmount = Number(order.refundedAmount || 0) + amount;
    order.refundStatus = order.refundedAmount >= maxRefundable ? 'full' : 'partial';
    order.refundNotes = notes;
    order.refundedAt = new Date();

    // إذا تم رد كامل المبلغ وطلب غير مدفوع، تظل الحالة كما هي
    // إذا كان مدفوع وتم رد كامل المبلغ، نحفظ ذلك فقط كسجل مالي

    await order.save();
    res.json({ message: 'Refund processed', order });
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
    .populate('senderCustomer', 'name phone')
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
      .populate('assignedDriver', 'name availability')
      .populate('senderCustomer', 'name phone email address'); // أضف هذا السطر

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تأكيد تسليم المرتجع للعميل (تسوية المرتجع)
exports.settleReturnToCustomer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'returned') {
      return res.status(400).json({ error: 'Only returned orders can be settled' });
    }
    if (order.returnSettled) {
      return res.json({ message: 'Already settled', order });
    }

    order.returnSettled = true;
    await order.save();
    res.json({ message: 'Return settled for customer', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};