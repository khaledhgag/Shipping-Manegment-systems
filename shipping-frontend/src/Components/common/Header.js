import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="logo">نظام إدارة التوصيل</div>
      <div className="user-info">
        <span>مرحباً، {currentUser?.name}</span>
        <span>({currentUser?.role})</span>
        <button onClick={handleLogout} className="btn btn-logout">
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
};

export default Header;