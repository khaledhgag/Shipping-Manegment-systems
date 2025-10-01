import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Login from './Components/auth/Login';
import Register from './Components/auth/Register';
import AdminDashboard from './Components/admin/Dashboard';
import EmployeeDashboard from './Components/employee/Dashboard';
import UserManagement from './Components/admin/UserMangment';
import DriverManagement from './Components/admin/DriverMangement';
import OrderManagement from './Components/admin/OrderMangment';
import PaymentManagement from './Components/admin/PaymentMngment';
import ReportManagement from './Components/admin/ReportMangment';
import EmployeeOrderManagement from './Components/employee/OrderMangment';
import EmployeeDriverManagement from './Components/employee/DiverMangment';
import MainLayout from './Components/layout.js/MainLayout';

function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
        
        <Route path="/" element={currentUser ? <MainLayout /> : <Navigate to="/login" />}>
          <Route index element={currentUser?.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />} />
          
          {/* Admin Routes */}
          {currentUser?.role === 'admin' && (
            <>
              <Route path="users" element={<UserManagement />} />
              <Route path="drivers" element={<DriverManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="reports" element={<ReportManagement />} />
            </>
          )}
          
          {/* Employee Routes */}
          {currentUser?.role === 'employee' && (
            <>
              <Route path="orders" element={<EmployeeOrderManagement />} />
              <Route path="drivers" element={<EmployeeDriverManagement />} />
            </>
          )}
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    
  );
  
}

export default AppRoutes;