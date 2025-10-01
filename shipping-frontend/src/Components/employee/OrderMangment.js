import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../Services/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'فشل في جلب الطلبات');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'فشل في تحديث حالة الطلب');
    }
  };

  const assignDriver = async (orderId, driverId) => {
    try {
      await api.put(`/orders/${orderId}/assign`, { driverId });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, assignedDriver: driverId } : order
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'فشل في تعيين سائق');
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-management">
      <h1>إدارة الطلبات</h1>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>اسم العميل</th>
              <th>من</th>
              <th>إلى</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th>السائق</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.customerName}</td>
                <td>{order.from}</td>
                <td>{order.to}</td>
                <td>{order.price}</td>
                <td>
                  <span className={`status status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  {order.assignedDriver ? order.assignedDriver.name : 'غير محدد'}
                </td>
                <td>
                  <div className="actions">
                    <Link to={`/employee/orders/${order._id}`} className="btn btn-view">
                      عرض
                    </Link>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">معلق</option>
                      <option value="assigned">مُسند</option>
                      <option value="in-transit">قيد التوصيل</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="paid">مدفوع</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;