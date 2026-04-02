import React from 'react';
import { BarChart3, Users, TrendingUp, Package } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Products', value: '150', icon: Package, color: '#3b82f6' },
    { label: 'Total Users', value: '1,234', icon: Users, color: '#10b981' },
    { label: 'Orders Today', value: '45', icon: TrendingUp, color: '#f59e0b' },
    { label: 'Revenue', value: '₹45,000', icon: BarChart3, color: '#8b5cf6' },
  ];

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card" style={{ borderLeft: `4px solid ${stat.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>{stat.label}</p>
                  <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem' }}>{stat.value}</h3>
                </div>
                <Icon size={40} color={stat.color} opacity={0.2} style={{ strokeWidth: 1 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Recent Activity</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Event</th>
              <th>User</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>New Order</td>
              <td>John Doe</td>
              <td>2 hours ago</td>
              <td><span style={{ color: '#10b981' }}>✓ Completed</span></td>
            </tr>
            <tr>
              <td>Product Added</td>
              <td>Admin</td>
              <td>1 day ago</td>
              <td><span style={{ color: '#10b981' }}>✓ Completed</span></td>
            </tr>
            <tr>
              <td>User Registration</td>
              <td>Jane Smith</td>
              <td>3 days ago</td>
              <td><span style={{ color: '#10b981' }}>✓ Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
