// services/ReportService.js
const Order = require('../models/Order');
const Driver = require('../models/DriverModel');
const User = require('../models/UserModel');
const Payment = require('../models/PaymentModel');

// 📦 Orders Report
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
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'assignedDriver',
          foreignField: '_id',
          as: 'driver'
        }
      },
      {
        $project: {
          orderNumber: 1,
          customerName: 1,
          from: 1,
          to: 1,
          price: 1,
          status: 1,
          paymentStatus: 1,
          createdAt: 1,
          updatedAt: 1,
          employee: { $arrayElemAt: ['$employee.name', 0] },
          driver: { $arrayElemAt: ['$driver.name', 0] }
        }
      }
    ]);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👨‍💻 Employees Report
exports.getEmployeesReport = async (req, res) => {
  try {
    const employees = await User.aggregate([
      { $match: { role: 'employee' } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          totalOrders: { $size: '$orders' },
          totalAmount: { $sum: '$orders.price' }
        }
      }
    ]);

    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🛵 Drivers Report
exports.getDriversReport = async (req, res) => {
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
          deliveredOrders: {
            $size: {
              $filter: {
                input: '$orders',
                as: 'o',
                cond: { $eq: ['$$o.status', 'delivered'] }
              }
            }
          },
          inTransitOrders: {
            $size: {
              $filter: {
                input: '$orders',
                as: 'o',
                cond: { $eq: ['$$o.status', 'in-transit'] }
              }
            }
          },
          totalCollected: { $sum: '$orders.price' }
        }
      }
    ]);

    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 💰 Revenue Report (Order Based)
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { paymentStatus: 'paid' };

    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const revenue = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' }, // price من الـ order
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(revenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
