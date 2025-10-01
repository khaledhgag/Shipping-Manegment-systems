import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '././context/AuthContext';
import PrivateRoute from './Components/common/PrivateRoute';
import Login from './Components/Pages/Login';
import AdminDashboard from './Components/Pages/AdminDashboard';
import EmployeeDashboard from './Components/Pages/EmployeeDashboard';
import OrderDetails from './Components/admin/OrderMangment';

import './styles/app.css';


// مكونات المسؤول
const AdminUserManagement = React.lazy(() => import('./Components/admin/UserMangment'));
const AdminDriverManagement = React.lazy(() => import('./Components/admin/DriverMangement'));
const AdminOrderManagement = React.lazy(() => import('./Components/admin/OrderMangment'));
const AdminPaymentManagement = React.lazy(() => import('./Components/admin/PaymentMngment'));
const AdminReports = React.lazy(() => import('./Components/admin/ReportMangment'));
const AdminDashboardHome = React.lazy(() => import('./Components/admin/Dashboardhome'));

// مكونات الموظف
const EmployeeOrderManagement = React.lazy(() => import('./Components/employee/OrderMangment'));
const EmployeeDriverManagement = React.lazy(() => import('./Components/employee/DiverMangment'));
const EmployeeDashboardHome = React.lazy(() => import('./Components/employee/Dashboard'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <React.Suspense fallback={<div className="loading">جاري التحميل...</div>}>
            <Routes>
              {/* المسارات العامة */}
              <Route path="/login" element={<Login />} />
              
              {/* مسارات المسؤول */}
              <Route path="/admin" element={<PrivateRoute roles={['admin']} />}>
                <Route path="dashboard" element={<AdminDashboard />}>
                  <Route index element={<AdminDashboardHome />} />
                  <Route path="orders/:id" element={<OrderDetails />} /> 
                  <Route path="users" element={<AdminUserManagement />} />
                  <Route path="drivers" element={<AdminDriverManagement />} />
                  <Route path="orders" element={<AdminOrderManagement />} />
                  <Route path="payments" element={<AdminPaymentManagement />} />
                  <Route path="reports" element={<AdminReports />} />
                </Route>
              </Route>
              
              {/* مسارات الموظف */}
              <Route path="/employee" element={<PrivateRoute roles={['employee']} />}>
                <Route path="dashboard" element={<EmployeeDashboard />}>
                  <Route index element={<EmployeeDashboardHome />} />
                  <Route path="orders" element={<EmployeeOrderManagement />} />
                  <Route path="drivers" element={<EmployeeDriverManagement />} />
                </Route>
              </Route>
              
              {/* التوجيه الافتراضي */}
              <Route path="/" element={<Navigate to="/login" />} />
              
              صفحة غير موجودة
            </Routes>
          </React.Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;