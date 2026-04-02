import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle } from 'lucide-react';
import './CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="customer-layout">
      <header className="customer-header">
        <div className="header-content">
          <div className="brand">
            <MessageCircle size={24} />
            <h1>ShoppySup</h1>
          </div>
          <div className="header-right">
            <span className="user-name">Hello, {user?.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>
      <main className="customer-content">
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;
