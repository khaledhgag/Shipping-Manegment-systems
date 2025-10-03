// src/Components/admin/CustomerManagement.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../Services/api';

const CustomerManagement = () => {
  const { id } = useParams();
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchCustomerWithOrders(id);
    } else {
      fetchCustomers();
    }
  }, [id]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await api.get(`/customers?t=${timestamp}`);
      setCustomers(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerWithOrders = async (customerId) => {
  setLoading(true);
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(`/customers/${customerId}/details?t=${timestamp}`);
    
    setCustomer(response.data.customer);
    setOrders(response.data.orders || []);
    setFormData(response.data.customer);
    setError('');
  } catch (err) {
    setError(err.response?.data?.error || 'فشل في جلب بيانات العميل');
  } finally {
    setLoading(false);
  }
};

  const refreshData = () => {
    if (id) {
      fetchCustomerWithOrders(id);
    } else {
      fetchCustomers();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/customers/${id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      });
      setShowForm(false);
      setEditMode(false);
      
      if (!id) {
        fetchCustomers();
      } else {
        fetchCustomerWithOrders(id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'فشل في حفظ العميل');
    }
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setEditMode(true);
    setShowForm(true);
  };

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p className="error-message">{error}</p>;

  // Customer Detail View
  if (id && customer) {
    return (
      <div className="customer-detail">
        <div className="detail-header">
          <Link to="/admin/dashboard/customers" className="btn btn-back">
            <i className="fas fa-arrow-right"></i> العودة للقائمة
          </Link>
          <div className="header-info">
            <h1>تفاصيل العميل</h1>
            <div className="customer-name">{customer.name}</div>
          </div>
          <button 
            className="btn btn-refresh"
            onClick={refreshData}
          >
            <i className="fas fa-sync-alt"></i> تحديث
          </button>
          <button 
            className="btn btn-edit"
            onClick={() => handleEdit(customer)}
          >
            <i className="fas fa-edit"></i> تعديل العميل
          </button>
        </div>

        <div className="detail-sections">
          {/* Customer Information */}
          <div className="detail-section">
            <h2><i className="fas fa-user"></i> معلومات العميل</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">الاسم:</span>
                <span>{customer.name}</span>
              </div>
              <div className="detail-item">
                <span className="label">رقم الهاتف:</span>
                <span>{customer.phone}</span>
              </div>
              <div className="detail-item">
                <span className="label">البريد الإلكتروني:</span>
                <span>{customer.email || 'غير متوفر'}</span>
              </div>
              <div className="detail-item">
                <span className="label">العنوان:</span>
                <span>{customer.address || 'غير متوفر'}</span>
              </div>
            </div>
          </div>

          {/* Customer Statistics */}
          <div className="detail-section">
            <h2><i className="fas fa-chart-bar"></i> إحصائيات العميل</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{orders.length}</div>
                <div className="stat-label">إجمالي الطلبات</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {orders.reduce((sum, order) => sum + (order.price || 0), 0)} EG
                </div>
                <div className="stat-label">إجمالي القيمة</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {orders.reduce((sum, order) => 
                    order.paymentStatus === 'pending' ? sum + (order.price || 0) : sum, 0
                  )} EG
                </div>
                <div className="stat-label">مدفوعات معلقة</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {orders.filter(order => order.status === 'returned').length}
                </div>
                <div className="stat-label">طلبات مرتجعة</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{customer.balance || 0} EG</div>
                <div className="stat-label">رصيد مستحق</div>
              </div>
            </div>
          </div>

          {/* Customer Orders */}
          <div className="detail-section">
            <h2><i className="fas fa-box"></i> طلبات العميل</h2>
            {orders.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>رقم الطلب</th>
                      <th>حالة المرتجع</th>
                      <th>المستلم</th>
                      <th>من</th>
                      <th>إلى</th>
                      <th>السعر</th>
                      <th>حالة الشحن</th>
                      <th>حالة الدفع</th>
                      <th>التاريخ</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>{order.orderNumber}</td>
                        <td>{order.status === 'returned' ? (order.returnSettled ? 'مُسوية' : 'غير مُسوية') : '-'}</td>
                        <td>{order.receiverName}</td>
                        <td>{order.from}</td>
                        <td>{order.to}</td>
                        <td>{order.price} EG</td>
                        <td>
                          <span className={`status ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span className={`status ${order.paymentStatus}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          {order.status === 'returned' && !order.returnSettled && (
                            <button
                              className="btn btn-save"
                              onClick={async () => {
                                try {
                                  await api.post(`/orders/${order._id}/settle-return`);
                                  fetchCustomerWithOrders(id);
                                } catch (err) {
                                  setError(err.response?.data?.error || 'فشل في تسوية المرتجع');
                                }
                              }}
                            >
                              تسوية المرتجع
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>لا توجد طلبات لهذا العميل</p>
            )}
          </div>

          {/* Payout */}
          <div className="detail-section">
            <h2><i className="fas fa-money-bill-wave"></i> دفع للعميل</h2>
            <div className="payout-form">
              <input
                type="number"
                placeholder="المبلغ"
                onChange={(e) => setFormData({ ...formData, payoutAmount: e.target.value })}
              />
              <input
                type="text"
                placeholder="ملاحظات (اختياري)"
                onChange={(e) => setFormData({ ...formData, payoutNotes: e.target.value })}
              />
              <button
                className="btn btn-save"
                onClick={async () => {
                  try {
                    await api.post(`/customers/${id}/payout`, { amount: Number(formData.payoutAmount || 0), notes: formData.payoutNotes || '' });
                    await fetchCustomerWithOrders(id);
                    setFormData({ ...formData, payoutAmount: '', payoutNotes: '' });
                  } catch (err) {
                    setError(err.response?.data?.error || 'فشل في الدفع للعميل');
                  }
                }}
                disabled={!formData.payoutAmount}
              >
                دفع
              </button>
            </div>
          </div>

          {/* Payout History */}
          {customer.payoutHistory && customer.payoutHistory.length > 0 && (
            <div className="detail-section">
              <h2><i className="fas fa-history"></i> سجل المدفوعات</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>المبلغ</th>
                      <th>ملاحظات</th>
                      <th>بواسطة</th>
                      <th>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.payoutHistory.map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.amount} EG</td>
                        <td>{p.notes || '-'}</td>
                        <td>{p.by?.name || p.by || '-'}</td>
                        <td>{new Date(p.at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="detail-section">
              <h2><i className="fas fa-sticky-note"></i> ملاحظات</h2>
              <div className="notes-card">
                {customer.notes}
              </div>
            </div>
          )}
        </div>

        {/* Edit Form (conditionally rendered) */}
        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>تعديل العميل</h2>
              <form onSubmit={handleSubmit} className="customer-form">
                <div className="form-group">
                  <label>الاسم</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>العنوان</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-save">
                  حفظ التغييرات
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Customer List View
  return (
    <div className="customer-management">
      <div className="page-header">
        <h1>عملاء الشحن</h1>
        <button
          className="btn btn-add"
          onClick={() => {
            setShowForm(!showForm);
            setEditMode(false);
            setFormData({
              name: '',
              phone: '',
              email: '',
              address: '',
              notes: ''
            });
          }}
        >
          {showForm ? 'إلغاء' : 'إضافة عميل جديد'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label>الاسم</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>رقم الهاتف</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>العنوان</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-save">
            حفظ العميل
          </button>
        </form>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>البريد الإلكتروني</th>
              <th>إجمالي الطلبات</th>
              <th>القيمة الإجمالية</th>
              <th>المدفوعات المعلقة</th>
              <th>الطلبات المرتجعة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.email || 'غير متوفر'}</td>
                <td>{customer.totalOrders}</td>
                <td>{customer.totalValue} EG</td>
                <td className={customer.pendingPayments > 0 ? 'pending-payment' : ''}>
                  {customer.pendingPayments} EG
                </td>
                <td>{customer.returnedOrders}</td>
                <td>
                  <Link
                    to={`/admin/dashboard/customers/${customer._id}`}
                    className="btn btn-view"
                  >
                    عرض
                  </Link>
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEdit(customer)}
                  >
                    تعديل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerManagement;