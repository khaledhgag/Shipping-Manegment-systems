// src/Components/admin/OrderMangment.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../Services/api';

const OrderManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [filters, setFilters] = useState({ status: '', driverId: '', date: '' });
  const [trackingForm, setTrackingForm] = useState({ status: '', location: '', notes: '' });
  const [statusUpdate, setStatusUpdate] = useState('');
  const [paymentUpdate, setPaymentUpdate] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    from: '',
    to: '',
    productDetails: '',
    pieces: '',
    weight: '',
    price: '',
    driverId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const [orderRes, driversRes] = await Promise.all([
            api.get(`/orders/${id}`),
            api.get('/drivers/all'),
          ]);
          setOrder(orderRes.data);
          setDrivers(driversRes.data);
        } else {
          const [ordersRes, driversRes] = await Promise.all([
            api.get('/orders', { params: filters }),
            api.get('/drivers/all'),
          ]);
          setOrders(ordersRes.data);
          setDrivers(driversRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'فشل في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, filters]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/orders/${formData._id}`, formData);
      } else {
        await api.post('/orders', formData);
      }
      
      setFormData({
        customerName: '',
        customerPhone: '',
        from: '',
        to: '',
        productDetails: '',
        pieces: '',
        weight: '',
        price: '',
        driverId: '',
      });
      setShowForm(false);
      setEditMode(false);

      const res = await api.get('/orders', { params: filters });
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'فشل في حفظ الطلب');
    }
  };

  const handleEdit = (order) => {
    setFormData(order);
    setEditMode(true);
    setShowForm(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTracking = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/orders/${id}/tracking`, trackingForm);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      setTrackingForm({ status: '', location: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add tracking update');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await api.put(`/orders/${id}/status`, { status: statusUpdate });
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      setStatusUpdate('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleUpdatePayment = async () => {
    try {
      await api.put(`/orders/${id}/payment`, { paymentStatus: paymentUpdate });
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      setPaymentUpdate('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update payment');
    }
  };

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p className="error-message">{error}</p>;

  // Order Detail View
  if (id && order) {
    return (
      <div className="order-detail">
        <div className="detail-header">
          <button className="btn btn-back" onClick={() => navigate('/admin/dashboard/orders')}>
            <i className="fas fa-arrow-right"></i> العودة للقائمة
          </button>
          <div className="header-info">
            <h1>تفاصيل الطلب</h1>
            <div className="order-number">#{order.orderNumber}</div>
          </div>
          <button 
            className="btn btn-edit"
            onClick={() => handleEdit(order)}
          >
            <i className="fas fa-edit"></i> تعديل الطلب
          </button>
        </div>

        <div className="detail-sections">
          {/* Status Cards */}
          <div className="status-cards">
            <div className={`status-card ${order.status}`}>
              <div className="status-icon">
                {order.status === 'pending' && <i className="fas fa-clock"></i>}
                {order.status === 'assigned' && <i className="fas fa-user-check"></i>}
                {order.status === 'in-transit' && <i className="fas fa-truck"></i>}
                {order.status === 'delivered' && <i className="fas fa-check-circle"></i>}
                {order.status === 'paid' && <i className="fas fa-money-bill-wave"></i>}
                {order.status === 'cancelled' && <i className="fas fa-times-circle"></i>}
              </div>
              <div className="status-info">
                <div className="status-label">حالة الشحن</div>
                <div className="status-value">{order.status}</div>
              </div>
            </div>
            
            <div className={`status-card ${order.paymentStatus}`}>
              <div className="status-icon">
                {order.paymentStatus === 'pending' && <i className="fas fa-hourglass-half"></i>}
                {order.paymentStatus === 'paid' && <i className="fas fa-check-double"></i>}
                {order.paymentStatus === 'failed' && <i className="fas fa-exclamation-triangle"></i>}
              </div>
              <div className="status-info">
                <div className="status-label">حالة الدفع</div>
                <div className="status-value">{order.paymentStatus}</div>
              </div>
            </div>
            
            <div className="status-card price-card">
              <div className="status-icon">
                <i className="fas fa-money-check-alt"></i>
              </div>
              <div className="status-info">
                <div className="status-label">السعر</div>
                <div className="status-value">{order.price} EG</div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="detail-section">
            <h2><i className="fas fa-info-circle"></i> معلومات الطلب</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">رقم الطلب:</span>
                <span>{order.orderNumber}</span>
              </div>
              <div className="detail-item">
                <span className="label">تاريخ الإنشاء:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">عدد القطع:</span>
                <span>{order.pieces}</span>
              </div>
              <div className="detail-item">
                <span className="label">الوزن:</span>
                <span>{order.weight ? `${order.weight} كجم` : 'غير محدد'}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="detail-section">
            <h2><i className="fas fa-user"></i> معلومات العميل</h2>
            <div className="customer-card">
              <div className="customer-info">
                <div className="customer-name">{order.customerName}</div>
                <div className="customer-phone">
                  <i className="fas fa-phone"></i> {order.customerPhone}
                </div>
              </div>
              <div className="route-info">
                <div className="route-item">
                  <div className="route-label">من:</div>
                  <div className="route-value">{order.from}</div>
                </div>
                <div className="route-arrow">
                  <i className="fas fa-long-arrow-alt-left"></i>
                </div>
                <div className="route-item">
                  <div className="route-label">إلى:</div>
                  <div className="route-value">{order.to}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="detail-section">
            <h2><i className="fas fa-box"></i> معلومات المنتج</h2>
            <div className="product-card">
              <div className="product-details">
                {order.productDetails || 'لا توجد تفاصيل'}
              </div>
            </div>
          </div>

          {/* Driver Information */}
          <div className="detail-section">
            <h2><i className="fas fa-user-tie"></i> معلومات السائق</h2>
            {order.assignedDriver ? (
              <div className="driver-card">
                <div className="driver-avatar">
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="driver-info">
                  <div className="driver-name">{order.assignedDriver.name}</div>
                  <div className={`driver-status ${order.assignedDriver.availability}`}>
                    {order.assignedDriver.availability === 'available' ? (
                      <><i className="fas fa-check-circle"></i> متاح</>
                    ) : (
                      <><i className="fas fa-busy"></i> مشغول</>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-driver-card">
                <i className="fas fa-user-slash"></i>
                <p>لم يتم تعيين سائق لهذا الطلب</p>
              </div>
            )}
          </div>

          {/* Tracking Timeline */}
          <div className="detail-section">
            <h2><i className="fas fa-route"></i> سجل التتبع</h2>
            {order.tracking.length > 0 ? (
              <div className="tracking-timeline">
                {order.tracking.map((track, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <div className="timeline-status">{track.status}</div>
                        <div className="timeline-time">
                          {new Date(track.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {track.location && (
                        <div className="timeline-location">
                          <i className="fas fa-map-marker-alt"></i> {track.location}
                        </div>
                      )}
                      {track.notes && (
                        <div className="timeline-notes">
                          <i className="fas fa-sticky-note"></i> {track.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-tracking-card">
                <i className="fas fa-route"></i>
                <p>لا يوجد تحديثات تتبع لهذا الطلب</p>
              </div>
            )}
          </div>

          {/* Status Update Section */}
          <div className="detail-section">
            <h2><i className="fas fa-sync-alt"></i> تحديث الحالة</h2>
            <div className="update-controls">
              <div className="update-group">
                <label>حالة الشحن:</label>
                <div className="update-input-group">
                  <select 
                    value={statusUpdate} 
                    onChange={(e) => setStatusUpdate(e.target.value)}
                  >
                    <option value="">اختر الحالة</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="assigned">تم التعيين</option>
                    <option value="in-transit">قيد التوصيل</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="paid">مدفوع</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                  <button 
                    className="btn btn-update" 
                    onClick={handleUpdateStatus}
                    disabled={!statusUpdate}
                  >
                    تحديث
                  </button>
                </div>
              </div>
              
              <div className="update-group">
                <label>حالة الدفع:</label>
                <div className="update-input-group">
                  <select 
                    value={paymentUpdate} 
                    onChange={(e) => setPaymentUpdate(e.target.value)}
                  >
                    <option value="">اختر الحالة</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="paid">مدفوع</option>
                    <option value="failed">فشل</option>
                  </select>
                  <button 
                    className="btn btn-update" 
                    onClick={handleUpdatePayment}
                    disabled={!paymentUpdate}
                  >
                    تحديث
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Tracking Update */}
          <div className="detail-section">
            <h2><i className="fas fa-plus-circle"></i> إضافة تحديث تتبع</h2>
            <form onSubmit={handleAddTracking} className="tracking-form">
              <div className="form-row">
                <div className="form-group">
                  <label>الحالة</label>
                  <select
                    value={trackingForm.status}
                    onChange={(e) => setTrackingForm({...trackingForm, status: e.target.value})}
                    required
                  >
                    <option value="">اختر الحالة</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="assigned">تم التعيين</option>
                    <option value="in-transit">قيد التوصيل</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="paid">مدفوع</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>الموقع</label>
                  <input
                    type="text"
                    value={trackingForm.location}
                    onChange={(e) => setTrackingForm({...trackingForm, location: e.target.value})}
                    placeholder="أدخل الموقع الحالي"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>ملاحظات</label>
                <textarea
                  value={trackingForm.notes}
                  onChange={(e) => setTrackingForm({...trackingForm, notes: e.target.value})}
                  placeholder="أدخل أي ملاحظات إضافية"
                />
              </div>
              
              <button type="submit" className="btn btn-save">
                <i className="fas fa-save"></i> إضافة تحديث
              </button>
            </form>
          </div>
        </div>

        {/* Edit Form (conditionally rendered) */}
        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>{editMode ? 'تعديل الطلب' : 'إضافة طلب جديد'}</h2>
              <form onSubmit={handleSubmitOrder} className="order-form">
                <div className="form-group">
                  <label>اسم العميل</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>رقم هاتف العميل</label>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>من (عنوان الاستلام)</label>
                  <input
                    type="text"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>إلى (عنوان التسليم)</label>
                  <input
                    type="text"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>تفاصيل المنتج</label>
                  <textarea
                    value={formData.productDetails}
                    onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
                  />
                </div>

                <div className="form-inline">
                  <div className="form-group">
                    <label>عدد القطع</label>
                    <input
                      type="number"
                      value={formData.pieces}
                      onChange={(e) => setFormData({ ...formData, pieces: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>الوزن (كجم)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>السعر</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>اختيار السائق</label>
                  <select
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  >
                    <option value="">اختر السائق (اختياري)</option>
                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} ({driver.availability})
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-save">
                  {editMode ? 'تعديل الطلب' : 'حفظ الطلب'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Order List View
  return (
    <div className="order-management">
      <h1>إدارة الطلبات</h1>
      
      {!id && (
        <div className="filters">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="assigned">تم التعيين</option>
            <option value="in-transit">قيد التوصيل</option>
            <option value="delivered">تم التسليم</option>
            <option value="paid">مدفوع</option>
            <option value="cancelled">ملغي</option>
          </select>
          
          <select name="driverId" value={filters.driverId} onChange={handleFilterChange}>
            <option value="">كل السائقين</option>
            {drivers.map(driver => (
              <option key={driver._id} value={driver._id}>{driver.name}</option>
            ))}
          </select>
          
          <input 
            type="date" 
            name="date" 
            value={filters.date} 
            onChange={handleFilterChange} 
          />
        </div>
      )}

      <button
        className="btn btn-add"
        onClick={() => {
          setShowForm(!showForm);
          setEditMode(false);
          setFormData({
            customerName: '',
            customerPhone: '',
            from: '',
            to: '',
            productDetails: '',
            pieces: '',
            weight: '',
            price: '',
            driverId: '',
          });
        }}
      >
        {showForm ? 'إلغاء' : 'إضافة طلب جديد'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmitOrder} className="order-form">
          <div className="form-group">
            <label>اسم العميل</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>رقم هاتف العميل</label>
            <input
              type="text"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>من (عنوان الاستلام)</label>
            <input
              type="text"
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>إلى (عنوان التسليم)</label>
            <input
              type="text"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>تفاصيل المنتج</label>
            <textarea
              value={formData.productDetails}
              onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
            />
          </div>

          <div className="form-inline">
            <div className="form-group">
              <label>عدد القطع</label>
              <input
                type="number"
                value={formData.pieces}
                onChange={(e) => setFormData({ ...formData, pieces: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>الوزن (كجم)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>السعر</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>اختيار السائق</label>
            <select
              value={formData.driverId}
              onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
            >
              <option value="">اختر السائق (اختياري)</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} ({driver.availability})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-save">
            {editMode ? 'تعديل الطلب' : 'حفظ الطلب'}
          </button>
        </form>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>الهاتف</th>
              <th>من</th>
              <th>إلى</th>
              <th>السعر</th>
              <th>حالة الشحن</th>
              <th>حالة الدفع</th>
              <th>السائق</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.orderNumber}</td>
                <td>{order.customerName}</td>
                <td>{order.customerPhone}</td>
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
                <td>
                  {order.assignedDriver ? (
                    <>
                      {order.assignedDriver.name}{' '}
                      <span className={`status status-${order.assignedDriver.availability}`}>
                        {order.assignedDriver.availability}
                      </span>
                    </>
                  ) : (
                    'غير محدد'
                  )}
                </td>
                <td>
                  <Link
                    to={`/admin/dashboard/orders/${order._id}`}
                    className="btn btn-view"
                  >
                    عرض
                  </Link>
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEdit(order)}
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

export default OrderManagement;