import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContentForm, setShowContentForm] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    avatar: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'guide'
  });

  const getAllProfiles = () => {
  const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
  return Object.values(profiles)
    .filter(u => u && u.email) // 
    .map(u => ({ ...u })); 
  };


  const refreshUsers = () => {
    setUsers(getAllProfiles());
  };


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user')) || null;
    if (!storedUser) {
      navigate('/login');
      return;
    }

    setUser(storedUser);
    setIsAdmin(storedUser.role === 'admin');

    setUsers(getAllProfiles());

    const localContent = JSON.parse(localStorage.getItem('content') || '[]');
    setContent(localContent);

    setProfileData({
      name: storedUser.name || '',
      bio: storedUser.bio || '',
      avatar: storedUser.avatar || ''
    });

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');

    profiles[user.email] = {
      ...profiles[user.email],
      ...profileData,
      email: user.email,
      role: user.role,
      points: user.points || 0,
      banned: profiles[user.email]?.banned || false
    };

    localStorage.setItem('profiles', JSON.stringify(profiles));

    setUsers(getAllProfiles());
  }, [profileData, user]);

  useEffect(() => {
    localStorage.setItem('content', JSON.stringify(content));
  }, [content]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData({ ...profileData, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const getRiderLevel = (points = 0, role) => {
    if (role === 'admin') return 'Admin Rider';
    if (points >= 100) return 'Professional';
    if (points >= 50) return 'Advanced';
    if (points >= 20) return 'Intermediate';
    return 'Beginner';
  };

  const handleContentChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePublishContent = (e) => {
    e.preventDefault();
    const newContent = {
      id: Date.now(),
      ...formData,
      created_by: user.email,
      created_at: new Date().toISOString()
    };

    setContent([newContent, ...content]);
    setFormData({ title: '', description: '', content: '', type: 'guide' });
    setShowContentForm(false);
  };

  const handleDeleteContent = (id) => {
    setContent(content.filter((item) => item.id !== id));
  };

 const toggleBanUser = (email) => {
  const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');

    if (!profiles[email]) {
      console.warn(`No profile found for ${email}`);
      return;
    }

    profiles[email].banned = !profiles[email].banned;
    localStorage.setItem('profiles', JSON.stringify(profiles));

    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser?.email === email) {
      localStorage.setItem(
        'user',
        JSON.stringify({ ...currentUser, banned: profiles[email].banned })
      );
    }

  refreshUsers();
};


  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back
      </button>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            {profileData.avatar ? (
              <img
                src={profileData.avatar}
                alt="avatar"
                className="profile-avatar"
                onClick={() => document.getElementById('avatarInput').click()}
              />
            ) : (
              <div
                className="profile-avatar placeholder"
                onClick={() => document.getElementById('avatarInput').click()}
              >
                {profileData.name ? profileData.name.charAt(0) : '?'}
              </div>
            )}
            <input
              id="avatarInput"
              type="file"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          <div className="profile-info">
            <h2>{profileData.name || 'Admin'}</h2>
            <p className="profile-bio">
              {profileData.bio || 'Write something about yourself...'}
            </p>
            <span className="profile-level">
              {getRiderLevel(user.points, user.role)}
            </span>
          </div>
        </div>

        <div className="profile-form">
          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              rows="3"
            />
          </div>
        </div>
      </div>

      <div className="admin-header">
        <h2>My Content</h2>
        <button
          className="add-button"
          onClick={() => setShowContentForm(!showContentForm)}
        >
          {showContentForm ? '✕ Cancel' : '+ New Content'}
        </button>
      </div>

      {showContentForm && (
        <div className="admin-form-card">
          <form onSubmit={handlePublishContent}>
            <div className="form-group">
              <label>Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleContentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                name="description"
                value={formData.description}
                onChange={handleContentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleContentChange}
                rows="5"
                required
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleContentChange}
              >
                <option value="guide">Guide</option>
                <option value="news">News</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
            <button type="submit" className="submit-button">
              Publish
            </button>
          </form>
        </div>
      )}

      <div className="content-list">
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
                  <small className="content-date">
                    {new Date(item.created_at).toLocaleDateString()}
                  </small>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteContent(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

   {isAdmin && (
        <div className="users-section">
          <div className="users-header">
            <h2>Users ({users.length})</h2>
            <button className="refresh-users-btn" onClick={refreshUsers}>
              Refresh Users
            </button>
          </div>

          <table className="users-table">
          <thead>
            <tr>
              <th>Nickname</th>
              <th>Bio</th>
              <th>Rider Level</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {users.map(u => (
            <tr key={u.email}>
              <td>{u.name || u.email || 'N/A'}</td>
              <td>{u.bio || 'No bio'}</td>
              <td>{getRiderLevel(u.points, u.role)}</td>
              <td>{u.banned ? 'Banned' : 'Active'}</td>
              <td>
                <button className={u.banned ? 'unban' : 'ban'} onClick={() => toggleBanUser(u.email)}>
                  {u.banned ? 'Unban' : 'Ban'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
        </div>
      )}
    </div>
  );
}








