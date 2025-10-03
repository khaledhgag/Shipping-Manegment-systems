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
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({ status: '', driverId: '', date: '' });
  const [trackingForm, setTrackingForm] = useState({ status: '', location: '', notes: '' });
  const [statusUpdate, setStatusUpdate] = useState('');
  const [paymentUpdate, setPaymentUpdate] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    receiverName: '',
    receiverPhone: '',
    from: '',
    to: '',
    productDetails: '',
    pieces: '',
    weight: '',
    productPrice: '',
    shippingCost: '',
    price: '',
    driverId: '',
    senderCustomerId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const [orderRes, driversRes, customersRes] = await Promise.all([
            api.get(`/orders/${id}`),
            api.get('/drivers/all'),
            api.get('/customers')
          ]);
          setOrder(orderRes.data);
          setDrivers(driversRes.data);
          setCustomers(customersRes.data);
        } else {
          const [ordersRes, driversRes, customersRes] = await Promise.all([
            api.get('/orders', { params: filters }),
            api.get('/drivers/all'),
            api.get('/customers')
          ]);
          setOrders(ordersRes.data);
          setDrivers(driversRes.data);
          setCustomers(customersRes.data);
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
      // Normalize payload: backend expects `senderCustomer` not `senderCustomerId`
      const payload = {
        ...formData,
        ...(formData.senderCustomerId
          ? { senderCustomer: formData.senderCustomerId }
          : {})
      };

      // احسب السعر الإجمالي من حقول المنتج والشحن إن وُجدت
      const product = Number(payload.productPrice || 0);
      const shipping = Number(payload.shippingCost || 0);
      if (!isNaN(product) || !isNaN(shipping)) {
        payload.price = product + shipping;
      }

      if (editMode) {
        await api.put(`/orders/${formData._id}`, payload);
      } else {
        await api.post('/orders', payload);
      }
      
      setFormData({
        customerName: '',
        customerPhone: '',
        receiverName: '',
        receiverPhone: '',
        from: '',
        to: '',
        productDetails: '',
        pieces: '',
        weight: '',
        productPrice: '',
        shippingCost: '',
        price: '',
        driverId: '',
        senderCustomerId: ''
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

  // Generate and print waybill for an order
  const printWaybill = (o) => {
    const orderData = o || order;
    if (!orderData) return;
    const sender = orderData.senderCustomer || { name: orderData.customerName, phone: orderData.customerPhone, address: orderData.from };
    const receiver = { name: orderData.receiverName, phone: orderData.receiverPhone };
    const price = orderData.price || 0;
    const weight = orderData.weight || '-';
    const details = orderData.productDetails || '-';
    const orderNumber = orderData.orderNumber || orderData._id;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(orderNumber)}`;
    const logoUrl = '/logo512.png';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Waybill ${orderNumber}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 16px; }
    .waybill { width: 800px; margin: 0 auto; border: 2px solid #222; padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #999; padding-bottom: 12px; margin-bottom: 12px; }
    .header .left { display: flex; align-items: center; gap: 12px; }
    .logo { width: 60px; height: 60px; object-fit: contain; }
    .title { font-size: 20px; font-weight: bold; }
    .order-num { font-size: 16px; color: #333; }
    .row { display: flex; gap: 16px; margin-bottom: 12px; }
    .col { flex: 1; border: 1px solid #ddd; padding: 12px; }
    .label { font-weight: bold; color: #555; display:block; margin-bottom: 6px; }
    .val { color: #111; }
    .barcode { display: flex; align-items: center; gap: 12px; }
    .footer { margin-top: 12px; border-top: 1px dashed #999; padding-top: 12px; display:flex; justify-content: space-between; align-items:center; }
    .small { font-size: 12px; color: #666; }
    @media print { body { margin: 0; } .waybill { border: none; } }
  </style>
 </head>
 <body>
  <div class="waybill">
    <div class="header">
      <div class="left">
        <img class="logo" src="${logoUrl}" alt="Company" />
        <div>
          <div class="title">Top Speed Shipping</div>
          <div class="order-num">Order #: ${orderNumber}</div>
        </div>
      </div>
      <div class="barcode">
        <img src="${qrUrl}" alt="QR" />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <span class="label">الراسل</span>
        <div class="val">${sender?.name || '-'}</div>
        <div class="small">Phone: ${sender?.phone || '-'}</div>
      </div>
      <div class="col">
        <span class="label">المستلم</span>
        <div class="val">${receiver?.name || '-'}</div>
        <div class="small">Phone: ${receiver?.phone || '-'}</div>
        <div class="small">Address: ${receiver?.address || '-'}</div>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <span class="label">Shipment Details</span>
        <div class="small">Price: ${price} EG</div>
        <div class="small">Weight: ${weight}</div>
        <div class="small">Notes: ${details}</div>
      </div>
      <div class="col">
        <span class="label">العنوان</span>
        <div class="small">من: ${orderData.from || '-'}</div>
        <div class="small">الي: ${orderData.to || '-'}</div>
        <div class="small">Created: ${new Date(orderData.createdAt).toLocaleString()}</div>
      </div>
    </div>

    <div class="footer">
      <div class="small">Please attach this label visibly on the parcel</div>
      <div class="small">Thank you for shipping with us</div>
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); setTimeout(() => window.close(), 300); };
  </script>
 </body>
 </html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
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

  // Add function to handle customer selection
  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    if (customerId) {
      const customer = customers.find(c => c._id === customerId);
      if (customer) {
        setFormData({
          ...formData,
          senderCustomerId: customerId,
          customerName: customer.name,
          customerPhone: customer.phone
        });
      }
    } else {
      setFormData({
        ...formData,
        senderCustomerId: '',
        customerName: '',
        customerPhone: ''
      });
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
                {order.status === 'returned' && <i className="fas fa-undo"></i>}
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
          {order.paymentStatus === 'paid' && (
            <div className="status-card">
              <div className="status-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="status-info">
                <div className="status-label">مدفوع للعميل</div>
                <div className="status-value">{order.senderPayoutAmount || 0} EG</div>
              </div>
            </div>
          )}
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
            <h2><i className="fas fa-user"></i> معلومات العملاء</h2>
            
            {order.senderCustomer ? (
              <div className="customer-card">
                <div className="customer-header">
                  <div className="customer-title">عميل الشحن</div>
                  <div className="customer-name">{order.senderCustomer.name}</div>
                  <div className="customer-phone">
                    <i className="fas fa-phone"></i> {order.senderCustomer.phone}
                  </div>
                  {order.senderCustomer.email && (
                    <div className="customer-email">
                      <i className="fas fa-envelope"></i> {order.senderCustomer.email}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="customer-card">
                <div className="customer-header">
                  <div className="customer-title">عميل الشحن</div>
                  <div className="customer-name">{order.customerName}</div>
                  <div className="customer-phone">
                    <i className="fas fa-phone"></i> {order.customerPhone}
                  </div>
                </div>
              </div>
            )}
            
            <div className="customer-card">
              <div className="customer-header">
                <div className="customer-title">عميل الاستلام</div>
                <div className="customer-name">{order.receiverName}</div>
                <div className="customer-phone">
                  <i className="fas fa-phone"></i> {order.receiverPhone}
                </div>
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
                    <option value="returned">مرتجع</option>
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
              {order.paymentStatus === 'paid' && (
                <div className="update-group">
                  <label>دفع للعميل:</label>
                  <div className="update-input-group">
                    <input
                      type="number"
                      placeholder="المبلغ"
                      value={paymentUpdate}
                      onChange={(e) => setPaymentUpdate(e.target.value)}
                    />
                    <button
                      className="btn btn-update"
                      onClick={async () => {
                        try {
                          await api.post(`/orders/${id}/payout`, { amount: Number(paymentUpdate) });
                          const res = await api.get(`/orders/${id}`);
                          setOrder(res.data);
                          setPaymentUpdate('');
                        } catch (err) {
                          setError(err.response?.data?.error || 'Failed to payout');
                        }
                      }}
                      disabled={!paymentUpdate}
                    >
                      دفع
                    </button>
                  </div>
                </div>
              )}
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
                    <option value="returned">مرتجع</option>
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

          {/* Return Information */}
          {order.status === 'returned' && (
            <div className="detail-section">
              <h2><i className="fas fa-undo"></i> معلومات المرتجعات</h2>
              <div className="return-info">
                <div className="return-reason">
                  <span className="label">سبب الإرجاع:</span>
                  <span>{order.returnReason || 'غير محدد'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Form (conditionally rendered) */}
        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>{editMode ? 'تعديل الطلب' : 'إضافة طلب جديد'}</h2>
              <form onSubmit={handleSubmitOrder} className="order-form">
                <div className="form-group">
                  <label>اختيار عميل (اختياري)</label>
                  <select
                    value={formData.senderCustomerId || ''}
                    onChange={handleCustomerSelect}
                  >
                    <option value="">إنشاء طلب جديد</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {!formData.senderCustomerId && (
                  <>
                    <div className="form-group">
                      <label>اسم العميل (صاحب الشحنة)</label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>رقم هاتف العميل (صاحب الشحنة)</label>
                      <input
                        type="text"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>اسم المستلم</label>
                  <input
                    type="text"
                    value={formData.receiverName || ''}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>رقم هاتف المستلم</label>
                  <input
                    type="text"
                    value={formData.receiverPhone || ''}
                    onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
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
            <option value="returned">مرتجع</option>
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
            receiverName: '',
            receiverPhone: '',
            from: '',
            to: '',
            productDetails: '',
            pieces: '',
            weight: '',
            productPrice: '',
            shippingCost: '',
            price: '',
            driverId: '',
            senderCustomerId: ''
          });
        }}
      >
        {showForm ? 'إلغاء' : 'إضافة طلب جديد'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmitOrder} className="order-form">
          <div className="form-group">
            <label>اختيار عميل (اختياري)</label>
            <select
              value={formData.senderCustomerId || ''}
              onChange={handleCustomerSelect}
            >
              <option value="">إنشاء طلب جديد</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          {!formData.senderCustomerId && (
            <>
              <div className="form-group">
                <label>اسم العميل (صاحب الشحنة)</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>رقم هاتف العميل (صاحب الشحنة)</label>
                <input
                  type="text"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>اسم المستلم</label>
            <input
              type="text"
              value={formData.receiverName || ''}
              onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>رقم هاتف المستلم</label>
            <input
              type="text"
              value={formData.receiverPhone || ''}
              onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
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

          <div className="form-inline">
            <div className="form-group">
              <label>سعر المنتج</label>
              <input
                type="number"
                value={formData.productPrice}
                onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>تكلفة الشحن</label>
              <input
                type="number"
                value={formData.shippingCost}
                onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>الإجمالي</label>
              <input
                type="number"
                value={Number(formData.productPrice || 0) + Number(formData.shippingCost || 0)}
                readOnly
              />
            </div>
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
              <th>صاحب الشحنة</th>
              <th>المستلم</th>
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
                <td>
                  {order.senderCustomer 
                    ? order.senderCustomer.name 
                    : order.customerName}
                </td>
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
                  <button
                    className="btn btn-print"
                    onClick={() => printWaybill(order)}
                  >
                    طباعة بوليصة الشحن
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