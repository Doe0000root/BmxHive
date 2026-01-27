import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { FiSearch, FiPlus } from "react-icons/fi";
import "../styles/forum.css";

const API_URL = "http://localhost:5000/api";

function Forum() {
  const { user, token } = useContext(AuthContext);
  const banned = Boolean(user?.banned);
  const navigate = useNavigate();
  const location = useLocation();
  const [tricks, setTricks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);

  const [newTrick, setNewTrick] = useState({
    title: "",
    description: "",
    video_url: "",
    video_file: null,
    level: "beginner",
    hashtags: "",
  });

  const fetchTricks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tricks`, {
        params: { level },
      });
      setTricks(res.data);
    } catch (err) {
      console.error("Fetch tricks error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTricks();
  }, [level]);

  const handleChange = (e) =>
    setNewTrick({ ...newTrick, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (banned) return alert("🚫 You are banned.");

    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/tricks`,
        {
          ...newTrick,
          hashtags: newTrick.hashtags
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTricks([res.data, ...tricks]);
      setNewTrick({
        title: "",
        description: "",
        video_url: "",
        level: "beginner",
        hashtags: "",
      });
      setShowPostForm(false);
    } catch (err) {
      console.error("Submit trick error:", err);
    }
  };

  const normalizeHashtags = (hashtags) => {
    if (!hashtags) return [];
    if (Array.isArray(hashtags)) return hashtags;
    return hashtags.split(",").map((h) => h.trim()).filter(Boolean);
  };

  const filteredTricks = tricks.filter((trick) =>
    normalizeHashtags(trick.hashtags).some((h) =>
      h.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="forum-wrapper">
      <aside className="left-sidebar">
        <div className="logo">BMX</div>

        {user && (
          <Link to="/profile" className="identity-bar">
            <img
              src={
                user.avatar_url ||
                "https://i.etsystatic.com/21799038/r/il/3e4e5d/2722919832/il_fullxfull.2722919832_1rth.jpg"
              }
              alt="avatar"
              className="identity-avatar"
            />

            <div className="identity-info">
              <span className="identity-name">
                {user?.name || "Anonymous"}
              </span>

              <span
                className={`identity-status ${
                  user.is_admin
                    ? "admin"
                    : banned
                    ? "banned"
                    : "user"
                }`}
              >
                {user.is_admin
                  ? "Admin"
                  : banned
                  ? "Banned"
                  : "Member"}
              </span>
            </div>
          </Link>
        )}

        <ul className="nav-list">
          <li className={level === "" ? "active" : ""}>
            <button onClick={() => setLevel("")}>All</button>
          </li>
          <li className={level === "beginner" ? "active" : ""}>
            <button onClick={() => setLevel("beginner")}>Beginner</button>
          </li>
          <li className={level === "advanced" ? "active" : ""}>
            <button onClick={() => setLevel("advanced")}>Advanced</button>
          </li>
        </ul>
      </aside>

      <main className="feed">
        <div className="search-box">
          <FiSearch />
          <input
            placeholder="Search hashtags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {user && !banned && (
            <button
              className="add-post-btn"
              onClick={() => setShowPostForm(!showPostForm)}
            >
              <FiPlus />
            </button>
          )}
        </div>

        {banned && (
          <div className="banned-banner">
            You are banned. Posting is disabled.
          </div>
        )}

        {showPostForm && user && !banned && (
          <div className="new-trick-form">
            <input
              name="title"
              placeholder="Trick title"
              value={newTrick.title}
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newTrick.description}
              onChange={handleChange}
            />
            <input
              type="url"
              name="video_url"
              placeholder="Video URL (optional)"
              value={newTrick.video_url}
              onChange={(e) =>
                setNewTrick({ ...newTrick, video_url: e.target.value })
              }
            />
            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                setNewTrick({ ...newTrick, video_file: e.target.files[0] })
              }
            />
            <input
              name="hashtags"
              placeholder="hashtags, comma separated"
              value={newTrick.hashtags}
              onChange={handleChange}
            />
            <select
              name="level"
              value={newTrick.level}
              onChange={handleChange}
            >
              <option value="beginner">Beginner</option>
              <option value="advanced">Advanced</option>
            </select>

            <button onClick={handleSubmit} className="tweet-submit">
              Post Trick
            </button>
          </div>
        )}

        <div className="feed-posts">
          {loading ? (
            <p>Loading...</p>
          ) : (
            filteredTricks.map((trick) => (
              <div className="post" key={trick.id}>
                <img
                  className="post-avatar"
                  src={trick.author_avatar}
                  alt=""
                />
                <div className="post-content">
                  <div className="post-header">
                    <span className="post-author">
                      {trick.author_name}
                    </span>
                    <span className="level-tag">{trick.level}</span>
                  </div>
                  <div className="post-title">{trick.title}</div>
                  <div className="post-text">{trick.description}</div>

                  {trick.video_url && (
                    <video controls className="post-video">
                      <source src={trick.video_url} />
                    </video>
                  )}

                  <div className="post-hashtags">
                    {normalizeHashtags(trick.hashtags).map((h, i) => (
                      <span key={i} className="hashtag">
                        #{h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <aside className="right-sidebar">
        <h2>Trending</h2>
        <ul>
          <li>#bmx</li>
          <li>#freestyle</li>
          <li>#tricks</li>
          <li>#advanced</li>
        </ul>
      </aside>
    </div>
  );
}

export default Forum;












