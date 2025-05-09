import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: '8px 18px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 600, cursor: 'pointer' }}>Logout</button>
      </div>
      <nav style={{ marginBottom: 24 }}>
        <Link to="posts" style={{ marginRight: 16 }}>Posts</Link>
        <Link to="tags" style={{ marginRight: 16 }}>Tags</Link>
        <Link to="types" style={{ marginRight: 16 }}>Types</Link>
        <Link to="users">Users</Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default AdminDashboard; 