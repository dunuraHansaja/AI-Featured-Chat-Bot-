import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, BarChart3, Package, MessageSquare, Settings } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Chatbot Performance', path: '/admin/performance', icon: MessageSquare },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <ul className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className="nav-link"
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <p>{user?.name}</p>
            <small>{user?.email}</small>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
