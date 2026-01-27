import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/admin.css";
import avatar from '../photos/admin_avatar.jpeg'

const API_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("admin_user");

      if (!token || !rawUser || rawUser === "undefined") {
        navigate("/adminlogin");
        return;
      }

      const parsed = JSON.parse(rawUser);
      const isAdmin =
        parsed.role === "admin" ||
        parsed.is_admin === true ||
        parsed.is_admin === 1;

      if (!isAdmin) {
        navigate("/adminlogin");
        return;
      }

      setUser(parsed);
      setProfileData({
        name: parsed.name || "",
        bio: parsed.bio || "",
        avatar: parsed.avatar_url || "",
      });

      fetchUsers();
      fetchPosts();
      setLoading(false);
    } catch {
      navigate("/adminlogin");
    }
  }, []);
  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await axios.get(`${API_URL}/admin/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setPostsLoading(false);
    }
  };


  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/adminlogin");
      }
    }
  };
  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;

    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      await axios.delete(`${API_URL}/admin/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      alert("Failed to delete post");
      fetchPosts(); 
    }
  };


  const toggleBanUser = async (userId, banned) => {
    if (userId === user.id) return;
    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, banned: !banned } : u
      )
    );

    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}/ban`,
        { banned: !banned },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch {
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, banned } : u
        )
      );
    }
  };

  const handleProfileChange = e => {
    const { name, value } = e.target;
    setProfileData(p => ({ ...p, [name]: value }));
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () =>
      setProfileData(p => ({ ...p, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      const res = await axios.put(
        `${API_URL}/admin/users/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("admin_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      alert("Profile updated");
    } catch {
      alert("Profile update failed");
    }
  };

  const getRiderLevel = (points = 0) => {
    if (points >= 100) return "Professional";
    if (points >= 50) return "Advanced";
    if (points >= 20) return "Intermediate";
    return "Beginner";
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div onClick={() => document.getElementById("avatarInput").click()}>
            {profileData.avatar ? (
              <div className="profile-avatar">
                <img src={profileData.avatar} alt="avatar" />
              </div>
            ) : (
              <div className="profile-avatar placeholder">
                <img
                  src={profileData.avatar || avatar}
                  alt="avatar"
                />
              </div>
            )}
          </div>

          <input
            id="avatarInput"
            type="file"
            hidden
            onChange={handleAvatarChange}
          />

          <div className="profile-info">
            <h2>{profileData.name || "Admin"}</h2>
            <p className="profile-bio">
              {profileData.bio || "Administrator account"}
            </p>
            <span className="admin-level">ADMIN</span>
            <span className="profile-level">
              {getRiderLevel(user.points)}
            </span>
          </div>
        </div>

        <div className="admin-form-card">
          <div className="form-group">
            <label>Nickname</label>
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
              rows="3"
              value={profileData.bio}
              onChange={handleProfileChange}
            />
          </div>

          <button className="submit-button" onClick={saveProfile}>
            Save Profile
          </button>
        </div>
      </div>
      <div className="users-section">
        <div className="users-header">
          <h2>
            Posts <span className="users-count">{posts.length}</span>
          </h2>
          <button className="refresh-users-btn" onClick={fetchPosts}>
            Refresh Posts
          </button>
        </div>

        {postsLoading ? (
          <div className="admin-loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="no-content">No posts found</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Level</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.author_name}</td>
                  <td>{p.level}</td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="ban"
                      onClick={() => deletePost(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="users-section">
        <div className="users-header">
          <h2>
            Users <span className="users-count">{users.length}</span>
          </h2>
          <button className="refresh-users-btn" onClick={fetchUsers}>
            Refresh Users
          </button>
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>Nickname</th>
              <th>Bio</th>
              <th>Level</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className={u.banned ? "banned" : ""}>
                <td>{u.name || u.email}</td>
                <td>{u.bio || "No bio"}</td>
                <td>{getRiderLevel(u.points)}</td>
                <td>{u.banned ? "Banned" : "Active"}</td>
                <td>
                  <button
                    disabled={u.id === user.id}
                    className={u.banned ? "unban" : "ban"}
                    onClick={() => toggleBanUser(u.id, u.banned)}
                  >
                    {u.id === user.id
                      ? "You"
                      : u.banned
                      ? "Unban"
                      : "Ban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
