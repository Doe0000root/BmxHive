import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ id: 1, email: 'admin@example.com' });
  const [isAdmin, setIsAdmin] = useState(true);
  const [content, setContent] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'guide'
  });

  // Simulate fetching data locally
  useEffect(() => {
    const localContent = JSON.parse(localStorage.getItem('content')) || [];
    const localUsers = JSON.parse(localStorage.getItem('users')) || [
      { id: 1, email: 'admin@example.com', banned: false },
      { id: 2, email: 'user1@example.com', banned: false },
      { id: 3, email: 'user2@example.com', banned: true }
    ];

    setContent(localContent);
    setUsers(localUsers);
    setLoading(false);
  }, []);

  // Update localStorage whenever content changes
  useEffect(() => {
    localStorage.setItem('content', JSON.stringify(content));
  }, [content]);

  // Update localStorage whenever users change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newContent = {
      id: Date.now(),
      ...formData,
      created_by: user.id,
      created_at: new Date().toISOString()
    };
    setContent([newContent, ...content]);
    setFormData({ title: '', description: '', content: '', type: 'guide' });
    setShowForm(false);
  };

  const handleDeleteContent = (id) => {
    setContent(content.filter(item => item.id !== id));
  };

  const toggleBanUser = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, banned: !u.banned } : u));
  };

  if (loading) return <div className="admin-loading">Loading...</div>;
  if (!isAdmin) return <div className="admin-loading">Access Denied</div>;

  return (
    <div className="admin-container">
      <button className="back-button" onClick={() => navigate('/')}>← Back</button>

      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Content'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea name="content" value={formData.content} onChange={handleChange} rows="6" required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="guide">Guide</option>
                <option value="news">News</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
            <button type="submit" className="submit-button">Publish</button>
          </form>
        </div>
      )}

      <div className="content-list">
        <h2>Published Content ({content.length})</h2>
        {content.length === 0 ? (
          <p className="no-content">No content published yet</p>
        ) : (
          <div className="content-grid">
            {content.map((item) => (
              <div key={item.id} className="content-card">
                <div className="content-header">
                  <h3>{item.title}</h3>
                  <span className="content-type">{item.type}</span>
                </div>
                <p className="content-description">{item.description}</p>
                <p className="content-preview">{item.content.substring(0, 100)}...</p>
                <div className="content-footer">
                  <small className="content-date">{new Date(item.created_at).toLocaleDateString()}</small>
                  <button className="delete-button" onClick={() => handleDeleteContent(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="users-list">
        <h2>Registered Users ({users.length})</h2>
        {users.length === 0 ? (
          <p>No users registered</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.banned ? 'Banned' : 'Active'}</td>
                  <td>
                    <button onClick={() => toggleBanUser(u.id)}>
                      {u.banned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Admin;




