import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../Components/auth/Login';

const Login = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      const user = JSON.parse(localStorage.getItem('user'));
      
      // توجيه المستخدم بناءً على دوره
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'فشل تسجيل الدخول');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>تسجيل الدخول</h1>
        {error && <div className="error-message">{error}</div>}
        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
};

export default Login;