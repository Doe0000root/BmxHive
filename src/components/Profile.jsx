import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    favorite_tricks: '',
    points: 0,
    rating: 0,
    position: 0,
    avatar_url: '',
    trick_videos: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    favorite_tricks: ''
  });

  // Compute riding level based on points
  const getRidingLevel = (points) => {
    if (points >= 100) return 'Professional';
    if (points >= 50) return 'Advanced';
    if (points >= 20) return 'Intermediate';
    return 'Beginner';
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);

    const storedProfiles = JSON.parse(localStorage.getItem('profiles')) || {};
    const userProfile = storedProfiles[storedUser.email] || {};
    setProfile({
      name: userProfile.name || '',
      bio: userProfile.bio || '',
      favorite_tricks: userProfile.favorite_tricks || '',
      points: userProfile.points || 0,
      rating: userProfile.rating || 0,
      position: userProfile.position || 0,
      avatar_url: userProfile.avatar_url || '',
      trick_videos: userProfile.trick_videos || []
    });
    setFormData({
      name: userProfile.name || '',
      bio: userProfile.bio || '',
      favorite_tricks: userProfile.favorite_tricks || ''
    });
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveProfile = (updatedProfile) => {
    const storedProfiles = JSON.parse(localStorage.getItem('profiles')) || {};
    storedProfiles[user.email] = updatedProfile;

    const allProfiles = Object.values(storedProfiles).sort((a, b) => b.points - a.points);
    allProfiles.forEach((p, index) => {
      p.position = index + 1;
      storedProfiles[p.email || p.name] = p;
    });

    localStorage.setItem('profiles', JSON.stringify(storedProfiles));
    setProfile(updatedProfile);
  };

  const handleSave = () => {
    const updatedProfile = { ...profile, ...formData };
    saveProfile(updatedProfile);
    setIsEditing(false);
  };

  const addPoints = (pointsToAdd) => {
    const updatedProfile = { 
      ...profile, 
      points: profile.points + pointsToAdd,
      rating: Math.min(5, Math.floor((profile.points + pointsToAdd) / 10))
    };
    saveProfile(updatedProfile);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedProfile = { ...profile, avatar_url: reader.result };
      saveProfile(updatedProfile);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedProfile = { ...profile, trick_videos: [...profile.trick_videos, reader.result] };
      saveProfile(updatedProfile);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-container">
      <button className="back-button" onClick={() => navigate('/')}>← Back</button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <img src={profile.avatar_url || 'https://i.etsystatic.com/21799038/r/il/3e4e5d/2722919832/il_fullxfull.2722919832_1rth.jpg'} alt="Profile" />
            <label className="avatar-upload-label">
              Upload Avatar
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="avatar-upload-input" />
            </label>
          </div>
          <div className="profile-header-content">
            <h1 className="profile-name">{profile.name || 'User'}</h1>
            <p className="profile-email">{user.email}</p>
            <span className="profile-level">{getRidingLevel(profile.points)}</span>
            <p className="profile-points">Points: {profile.points}</p>
            <p className="profile-rating">Rating: {profile.rating} / 5</p>
            <p className="profile-position">Leaderboard Position: #{profile.position}</p>
          </div>
        </div>

        <div className="profile-section">
          {!isEditing ? (
            <div className="profile-view">
              <div className="info-block">
                <h3>Bio</h3>
                <p>{profile.bio || 'No bio yet'}</p>
              </div>
              <div className="info-block">
                <h3>Favorite Tricks</h3>
                <p>{profile.favorite_tricks || 'None listed'}</p>
              </div>

              <div className="info-block">
                <h3>Trick Videos</h3>
                {profile.trick_videos.length === 0 ? (
                  <p>No tricks uploaded</p>
                ) : (
                  profile.trick_videos.map((v, i) => (
                    <video key={i} controls width="300" style={{ display: 'block', marginBottom: '1rem' }}>
                      <source src={v} type="video/mp4" />
                    </video>
                  ))
                )}
                <label className="trick-video-upload-label">
                  Upload Video
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="trick-video-input" />
                </label>
              </div>

              <div className="info-block">
                <button onClick={() => addPoints(10)}>Add 10 Points</button>
              </div>

              <button className="edit-button" onClick={() => setIsEditing(true)}>Edit Profile</button>
            </div>
          ) : (
            <form className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" />
              </div>
              <div className="form-group">
                <label>Favorite Tricks</label>
                <input type="text" name="favorite_tricks" value={formData.favorite_tricks} onChange={handleChange} placeholder="e.g., Bunny hop, Wheelie" />
              </div>
              <div className="form-actions">
                <button type="button" className="save-button" onClick={handleSave}>Save</button>
                <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        <button className="signout-button" onClick={handleSignOut}>Sign Out</button>
      </div>
    </div>
  );
}

export default Profile;





