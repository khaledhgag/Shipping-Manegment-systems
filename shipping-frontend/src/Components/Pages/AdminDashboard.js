import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

const AdminDashboard = () => {
  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'لوحة التحكم' },
    { path: '/admin/dashboard/users', label: 'إدارة المستخدمين' },
    { path: '/admin/dashboard/drivers', label: 'إدارة السائقين' },
    { path: '/admin/dashboard/orders', label: 'إدارة الطلبات' },
    { path: '/admin/dashboard/payments', label: 'إدارة المدفوعات' },
    { path: '/admin/dashboard/customers', label: 'إدارة العملاء' },
    { path: '/admin/dashboard/reports', label: 'التقارير' },
  ];

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar menuItems={adminMenuItems} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;