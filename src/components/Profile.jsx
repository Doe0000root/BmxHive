import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/profile.css";

const API_URL = "http://localhost:5000/api";

function Profile() {
  const navigate = useNavigate();
  
  const { user, token, updateUser, logout, updateBanStatus } =
    useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const videoInputRef = useRef(null);
  const isBanned = Boolean(user?.banned);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    favorite_tricks: "",
  });

  
  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      logout();
      navigate("/login");
      return true;
    }

    if (
      err.response?.status === 403 &&
      err.response?.data?.code === "BANNED"
    ) {
      updateBanStatus(true); 
      return true;
    }

    return false;
  };

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const getRidingLevel = (points = 0, role = "user") => {
    if (role === "admin") return "ADMIN";
    if (points >= 100) return "Professional";
    if (points >= 50) return "Advanced";
    if (points >= 20) return "Intermediate";
    return "Beginner";
  };

  
  useEffect(() => {
    if (!token) {
      logout();
      navigate("/login");
      return;
    }

    let mounted = true;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/profile/me`, authHeaders);
        if (!mounted) return;

        const data = res.data;

        setProfile(data);
        updateUser({ ...user, banned: Boolean(data.banned) });

        if (!isEditing) {
          setFormData({
            name: data.name || "",
            bio: data.bio || "",
            favorite_tricks: data.favorite_tricks || "",
          });
        }

        setLoading(false);
      } catch (err) {
        handleApiError(err);
        setLoading(false);
      }
    };

    fetchProfile();
    return () => (mounted = false);
  }, [token]);


  const safeRequest = async (fn) => {
    if (isBanned) return;
    try {
      return await fn();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () =>
    safeRequest(async () => {
      const res = await axios.put(
        `${API_URL}/profile/me`,
        formData,
        authHeaders
      );
      setProfile(res.data);
      setIsEditing(false);
    });

  const handleAvatarUpload = (e) =>
    safeRequest(async () => {
      const file = e.target.files[0];
      if (!file) return;

      const fd = new FormData();
      fd.append("avatar", file);

      const res = await axios.post(
        `${API_URL}/profile/avatar`,
        fd,
        authHeaders
      );
      setProfile(res.data);
    });

  const handleVideoUpload = (e) =>
  safeRequest(async () => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file");
      return;
    }

    const fd = new FormData();
    fd.append("video", file);

    const res = await axios.post(
      `${API_URL}/profile/video`,
      fd,
      {
        ...authHeaders,
        headers: {
          ...authHeaders.headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setProfile(res.data);
  })

  const addPoints = (points) =>
    safeRequest(async () => {
      const res = await axios.post(
        `${API_URL}/profile/add-points`,
        { points },
        authHeaders
      );
      setProfile(res.data);
    });

  if (loading || !profile) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    
    <div className="profile-container">
      {isBanned && (
        <div className="banned-banner">
          🚫 YOUR ACCOUNT IS BANNED — READ ONLY MODE
        </div>
      )}
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back
      </button>

       <button className="forum-profile-button" onClick={() => navigate("/forum")}>
        ← Forum
      </button>


      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <img
              src={
                profile.avatar_url ||
                "https://i.etsystatic.com/21799038/r/il/3e4e5d/2722919832/il_fullxfull.2722919832_1rth.jpg"
              }
              alt="Profile"
            />

            {!isBanned && (
              <label className="avatar-upload-label">
                Upload Avatar
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </label>
            )}
          </div>

          <div className="profile-header-content">
            <h1>{profile.name}</h1>
            <p>{profile.email}</p>

            <span className={`profile-level ${isBanned ? "role-banned" : ""}`}>
              {isBanned
                ? "BANNED"
                : getRidingLevel(profile.points, profile.role)}
            </span>

            <p>Points: {profile.points}</p>
            <p>Rating: {profile.rating ?? "N/A"} / 5</p>
            <p>Leaderboard Position: #{profile.position ?? "—"}</p>
          </div>
        </div>

        {!isEditing ? (
          <div className="profile-section profile-view">
            <div className="info-block">
              <h3>Bio</h3>
              <p>{profile.bio || "No bio yet"}</p>
            </div>

            <div className="info-block">
              <h3>Favorite Tricks</h3>
              <p>{profile.favorite_tricks || "None listed"}</p>
            </div>

            <div className="info-block">
              <h3>Trick Videos</h3>
              {(profile.trick_videos || []).length === 0 ? (
                <p>No tricks uploaded</p>
              ) : (
                profile.trick_videos.map((v, i) => (
                  <video key={i} controls>
                    <source src={v} type="video/mp4" />
                  </video>
                ))
              )}

              {!isBanned && (
                <div className="video-upload-row">
                  <label className="video-upload-btn">
                    Upload video
                    <input
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={handleVideoUpload}
                    />
                  </label>
                </div>
              )}
            </div>

            {!isBanned && (
              <>
                <button className="edit-button" onClick={() => addPoints(10)}>
                  +10 Points
                </button>
                <button
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="profile-section profile-form">
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Favorite Tricks</label>
              <input
                name="favorite_tricks"
                value={formData.favorite_tricks}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button className="save-button" onClick={handleSave}>
                Save
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <button className="signout-button" onClick={() => logout()}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Profile;

