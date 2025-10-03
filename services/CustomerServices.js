// services/CustomerService.js
const Customer = require('../models/CustomerModel');
const Order = require('../models/Order');

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const customer = new Customer({
      ...req.body,
      createdBy: req.user._id
    });

    await customer.save();
    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({
      message: 'Customer updated successfully',
      customer
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check if customer has orders
    const ordersCount = await Order.countDocuments({ senderCustomer: req.params.id });
    
    if (ordersCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing orders' 
      });
    }
    
    await Customer.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ senderCustomer: req.params.id })
      .populate('assignedDriver', 'name availability')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get customer statistics
exports.getCustomerStats = async (req, res) => {
  try {
    const customers = await Customer.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'senderCustomer',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          totalOrders: { $size: '$orders' },
          totalValue: { $sum: '$orders.price' },
          pendingPayments: {
            $sum: {
              $cond: [
                { $eq: ['$orders.paymentStatus', 'pending'] },
                '$orders.price',
                0
              ]
            }
          },
          returnedOrders: {
            $size: {
              $filter: {
                input: '$orders',
                as: 'order',
                cond: { $eq: ['$$order.status', 'returned'] }
              }
            }
          }
        }
      },
      {
        $sort: { totalOrders: -1 }
      }
    ]);
    
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerWithOrders = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
      return res.status(404).json({ message: "العميل غير موجود" });
    }

    const orders = await Order.find({ senderCustomer: customerId })
      .populate('assignedDriver', 'name availability')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .lean();

    // إضافة رؤوس لمنع التخزين المؤقت
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json({ customer, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

exports.getCustomerWithOrders = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
      return res.status(404).json({ message: "العميل غير موجود" });
    }

    const orders = await Order.find({ senderCustomer: customerId })
      .populate('assignedDriver', 'name availability')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .lean();

    // حساب الإحصائيات من الطلبات الفعلية
    const stats = {
      totalOrders: orders.length,
      totalValue: orders.reduce((sum, order) => sum + (order.price || 0), 0),
      pendingPayments: orders.reduce((sum, order) => 
        order.paymentStatus === 'pending' ? sum + (order.price || 0) : sum, 0
      ),
      returnedOrders: orders.filter(order => order.status === 'returned').length
    };

    // دمج الإحصائيات مع بيانات العميل
    const customerWithStats = {
      ...customer,
      ...stats
    };

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json({ customer: customerWithStats, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

exports.linkOrdersToCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    let updatedCount = 0;
    
    for (const customer of customers) {
      const result = await Order.updateMany(
        { 
          customerName: customer.name,
          customerPhone: customer.phone,
          senderCustomer: { $exists: false }
        },
        { $set: { senderCustomer: customer._id } }
      );
      
      updatedCount += result.modifiedCount;
    }
    
    res.json({ message: `Updated ${updatedCount} orders` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Payout to customer and record in history
exports.payoutCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const amount = Number(req.body.amount || 0);
    const notes = req.body.notes || '';
    if (amount <= 0) return res.status(400).json({ error: 'Invalid payout amount' });
    if (amount > Number(customer.balance || 0)) {
      return res.status(400).json({ error: 'Amount exceeds customer balance' });
    }

    customer.balance = Number(customer.balance || 0) - amount;
    customer.payoutHistory.push({ amount, notes, by: req.user._id, at: new Date() });
    await customer.save();

    res.json({ message: 'Payout recorded', customer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};