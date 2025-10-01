import React, { useState, useEffect } from 'react';
import api from '../../Services/api';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    vehicle: '',
    availability: 'available',
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'فشل في جلب السائقين');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/drivers', newDriver);
      setDrivers([...drivers, response.data.driver]);
      setNewDriver({
        name: '',
        phone: '',
        vehicle: '',
        availability: 'available',
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'فشل في إضافة السائق');
    }
  };

  const updateDriverStatus = async (driverId, status) => {
    try {
      await api.put(`/drivers/${driverId}/status`, { availability: status });
      setDrivers(
        drivers.map((driver) =>
          driver._id === driverId ? { ...driver, availability: status } : driver
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || 'فشل في تحديث حالة السائق');
    }
  };

  const deleteDriver = async (driverId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السائق؟')) {
      try {
        await api.delete(`/drivers/${driverId}`);
        setDrivers(drivers.filter((driver) => driver._id !== driverId));
      } catch (err) {
        setError(err.response?.data?.error || 'فشل في حذف السائق');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDriver({
      ...newDriver,
      [name]: value,
    });
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="driver-management">
      <h1>إدارة السائقين</h1>
      <button
        className="btn btn-add"
        onClick={() => setShowAddForm(!showAddForm)}
      >
        {showAddForm ? 'إلغاء' : 'إضافة سائق'}
      </button>

      {showAddForm && (
        <div className="add-form">
          <h2>إضافة سائق جديد</h2>
          <form onSubmit={handleAddDriver}>
            <div className="form-group">
              <label htmlFor="name">الاسم</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newDriver.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">رقم الهاتف</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={newDriver.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicle">المركبة</label>
              <input
                type="text"
                id="vehicle"
                name="vehicle"
                value={newDriver.vehicle}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="availability">الحالة</label>
              <select
                id="availability"
                name="availability"
                value={newDriver.availability}
                onChange={handleInputChange}
              >
                <option value="available">متاح</option>
                <option value="busy">مشغول</option>
                <option value="off">خارج الخدمة</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              إضافة
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>المركبة</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver._id}>
                <td>{driver.name}</td>
                <td>{driver.phone}</td>
                <td>{driver.vehicle}</td>
                <td>
                  <span className={`status status-${driver.availability}`}>
                    {driver.availability === 'available'
                      ? 'متاح'
                      : driver.availability === 'busy'
                      ? 'مشغول'
                      : 'خارج الخدمة'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <select
                      value={driver.availability}
                      onChange={(e) =>
                        updateDriverStatus(driver._id, e.target.value)
                      }
                      className="status-select"
                    >
                      <option value="available">متاح</option>
                      <option value="busy">مشغول</option>
                      <option value="off">خارج الخدمة</option>
                    </select>
                    <button
                      className="btn btn-delete"
                      onClick={() => deleteDriver(driver._id)}
                    >
                      حذف
                    </button>
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

export default DriverManagement;