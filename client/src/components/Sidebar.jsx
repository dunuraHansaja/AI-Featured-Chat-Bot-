import React from 'react';
import { Home, Package, ShoppingCart, Mic, User } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'voice', label: 'Voice Assistant', icon: Mic },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>ERP System</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <User size={20} />
          <span>Admin User</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;