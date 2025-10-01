import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../Components/common/Sidebar';
import Header from '../../Components/common/Header';

const EmployeeDashboard = () => {
  const employeeMenuItems = [
    { path: '/employee/dashboard', label: 'لوحة التحكم' },
    { path: '/employee/orders', label: 'إدارة الطلبات' },
    { path: '/employee/drivers', label: 'إدارة السائقين' },
  ];

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar menuItems={employeeMenuItems} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;