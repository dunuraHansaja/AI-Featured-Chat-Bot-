import React, { useState } from 'react';
import { Plus, Edit2, Trash2, User } from 'lucide-react';

const AdminSettings = () => {
  const [users, setUsers] = useState([
    { id: 1, username: 'john_admin', email: 'john@admin.com', role: 'Admin', status: 'Active' },
    { id: 2, username: 'jane_user', email: 'jane@customer.com', role: 'Customer', status: 'Active' },
  ]);

  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({ username: '', email: '', role: '', password: '' });

  const handleAddUser = () => {
    if (userFormData.username && userFormData.email && userFormData.role && userFormData.password) {
      setUsers([...users, { ...userFormData, id: Date.now(), status: 'Active' }]);
      setUserFormData({ username: '', email: '', role: '', password: '' });
      setShowUserForm(false);
    }
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div>
      <h1>Settings</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>General Settings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <label>Application Name</label>
            <input type="text" defaultValue="AI Featured Chat Bot" className="form-control" />
          </div>
          <div>
            <label>Support Email</label>
            <input type="email" defaultValue="support@chatbot.com" className="form-control" />
          </div>
          <div>
            <label>Business Hours</label>
            <input type="text" defaultValue="9:00 AM - 6:00 PM" className="form-control" />
          </div>
          <div>
            <label>Timezone</label>
            <select className="form-control">
              <option>IST (India Standard Time)</option>
              <option>GMT</option>
              <option>EST</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Settings</button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>User Management</h2>
          <button className="btn btn-primary" onClick={() => setShowUserForm(!showUserForm)}>
            <Plus size={18} /> Create User
          </button>
        </div>

        {showUserForm && (
          <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '5px' }}>
            <h3>Create New User</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Username</label>
                <input
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  placeholder="Username"
                  className="form-control"
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="Email"
                  className="form-control"
                />
              </div>
              <div>
                <label>Role</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="form-control"
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="Password"
                  className="form-control"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={handleAddUser}>Create User</button>
              <button className="btn btn-secondary" onClick={() => setShowUserForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td><span style={{ color: '#10b981' }}>● {user.status}</span></td>
                <td>
                  <button className="btn btn-sm" style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem' }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-sm" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleDeleteUser(user.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSettings;
