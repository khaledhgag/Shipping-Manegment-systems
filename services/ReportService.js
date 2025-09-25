// services/ReportService.js
const Order = require('../models/Order');
const Driver = require('../models/DriverModel');
const Payment = require('../models/PaymentModel');

exports.getOrdersReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const orders = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$price' }
        }
      }
    ]);
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDriversPerformance = async (req, res) => {
  try {
    const drivers = await Driver.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'assignedDriver',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          phone: 1,
          vehicle: 1,
          totalOrders: { $size: '$orders' },
          completedOrders: {
            $size: {
              $filter: {
                input: '$orders',
                as: 'order',
                cond: { $eq: ['$$order.status', 'delivered'] }
              }
            }
          }
        }
      }
    ]);
    
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const revenue = await Payment.aggregate([
      { $match: { ...match, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};