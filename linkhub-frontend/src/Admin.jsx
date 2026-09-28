import { useEffect, useState } from "react";
import api from "./api";

function Admin({ hub, refreshHub }) {
  const [links, setLinks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  // Profile
  const [showProfile, setShowProfile] = useState(false);
  const [profileTitle, setProfileTitle] = useState("");
  const [profileDescription, setProfileDescription] = useState("");

  useEffect(() => {
    setLinks(
      hub.links.map(l => ({
        ...l,
        isEditing: false,
        editTitle: l.title,
        editUrl: l.url
      }))
    );

    setProfileTitle(hub.title || "");
    setProfileDescription(hub.description || "");
  }, [hub]);

  // =========================
  // COPY PUBLIC LINK
  // =========================
  const copyPublicLink = () => {
    const publicUrl = `${window.location.origin}/u/${hub.slug}`;
    navigator.clipboard.writeText(publicUrl);
    alert("Public link copied:\n" + publicUrl);
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
  localStorage.removeItem("adminToken");

  // Redirect to signup/login page
  window.location.href = "/signup";
};


  // =========================
  // UPDATE HUB PROFILE
  // =========================
  const saveProfile = async () => {
    try {
      await api.put(`/hub/${hub._id}/profile`, {
        title: profileTitle,
        description: profileDescription
      });

      alert("Profile updated!");
      setShowProfile(false);
      refreshHub();
    } catch (err) {
      alert("Failed to update profile");
      console.error(err);
    }
  };

  // =========================
  // ADD LINK
  // =========================
  const addLink = async () => {
    try {
      if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
        alert("Please enter a valid URL starting with http:// or https://");
        return;
      }

      await api.post(`/hub/${hub._id}/links`, {
        title: newTitle,
        url: newUrl
      });

      setNewTitle("");
      setNewUrl("");
      refreshHub();
    } catch (err) {
      alert("Failed to add link");
      console.error(err);
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteLink = async linkId => {
    await api.delete(`/hub/${hub._id}/link/${linkId}`);
    refreshHub();
  };

  // =========================
  // SAVE EDIT
  // =========================
  const saveEdit = async (link, index) => {
    await api.put(`/hub/${hub._id}/link/${link._id}`, {
      title: link.editTitle,
      url: link.editUrl,
      priorityStart: link.priorityStart,
      priorityEnd: link.priorityEnd,
      isLive: link.isLive
    });

    const newLinks = [...links];
    newLinks[index].isEditing = false;
    setLinks(newLinks);
    refreshHub();
  };

  // =========================
  // REORDER (UP/DOWN)
  // =========================
  const moveLink = async (from, to) => {
    if (to < 0 || to >= links.length) return;

    const newLinks = [...links];
    const [moved] = newLinks.splice(from, 1);
    newLinks.splice(to, 0, moved);
    setLinks(newLinks);

    await api.put(`/hub/${hub._id}/reorder`, {
      orderedLinkIds: newLinks.map(l => l._id)
    });
  };

  // =========================
  // DRAG & DROP
  // =========================
  const onDragStart = index => setDragIndex(index);
  const onDragOver = e => e.preventDefault();

  const onDrop = async dropIndex => {
    if (dragIndex === null || dragIndex === dropIndex) return;

    const newLinks = [...links];
    const [moved] = newLinks.splice(dragIndex, 1);
    newLinks.splice(dropIndex, 0, moved);
    setLinks(newLinks);
    setDragIndex(null);

    await api.put(`/hub/${hub._id}/reorder`, {
      orderedLinkIds: newLinks.map(l => l._id)
    });
  };

  return (
    <div className="card">
      {/* ========================= */}
      {/* TOP BAR */}
      {/* ========================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #00ff88",
          paddingBottom: "10px"
        }}
      >
        <strong style={{ color: "#00ff88" }}>{hub.title}</strong>

        <div>
          <button onClick={copyPublicLink}>🔗 Copy Public Link</button>{" "}
          <button onClick={() => setShowProfile(!showProfile)}>
            ⚙️ Profile
          </button>{" "}
          <button onClick={logout}>🚪 Logout</button>
        </div>
      </div>

      {/* ========================= */}
      {/* PROFILE EDITOR */}
      {/* ========================= */}
      {showProfile && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3>Edit Profile</h3>

          <input
            placeholder="Hub Title"
            value={profileTitle}
            onChange={e => setProfileTitle(e.target.value)}
          />

          <input
            placeholder="Description"
            value={profileDescription}
            onChange={e => setProfileDescription(e.target.value)}
          />

          <div style={{ marginTop: "10px" }}>
            <button onClick={saveProfile}>💾 Save Profile</button>
            <button onClick={() => setShowProfile(false)}>❌ Cancel</button>
          </div>
        </div>
      )}

      <h2>Admin Panel</h2>

      {/* ========================= */}
      {/* ADD LINK */}
      {/* ========================= */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h4>Add New Link</h4>

        <input
          placeholder="Title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />

        <input
          placeholder="URL"
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
        />

        <button onClick={addLink}>Add Link</button>
      </div>

      <h3>Manage Links (Drag to Reorder)</h3>

      {links.map((link, index) => (
        <div
          key={link._id}
          draggable
          onDragStart={() => onDragStart(index)}
          onDragOver={onDragOver}
          onDrop={() => onDrop(index)}
          style={{
            border: "1px solid #00ff88",
            padding: "10px",
            marginBottom: "10px",
            background: "#0b0b0b",
            cursor: "grab"
          }}
        >
          {link.isEditing ? (
            <>
              <input
                value={link.editTitle}
                onChange={e => {
                  const newLinks = [...links];
                  newLinks[index].editTitle = e.target.value;
                  setLinks(newLinks);
                }}
              />

              <input
                value={link.editUrl}
                onChange={e => {
                  const newLinks = [...links];
                  newLinks[index].editUrl = e.target.value;
                  setLinks(newLinks);
                }}
              />

              <input
                value={link.priorityStart || ""}
                onChange={e => {
                  const newLinks = [...links];
                  newLinks[index].priorityStart = e.target.value;
                  setLinks(newLinks);
                }}
                placeholder="Priority Start (HH:MM)"
              />

              <input
                value={link.priorityEnd || ""}
                onChange={e => {
                  const newLinks = [...links];
                  newLinks[index].priorityEnd = e.target.value;
                  setLinks(newLinks);
                }}
                placeholder="Priority End (HH:MM)"
              />

              <label>
                <input
                  type="checkbox"
                  checked={!!link.isLive}
                  onChange={e => {
                    const newLinks = [...links];
                    newLinks[index].isLive = e.target.checked;
                    setLinks(newLinks);
                  }}
                />{" "}
                🔴 LIVE
              </label>

              <div>
                <button onClick={() => saveEdit(link, index)}>💾 Save</button>
                <button
                  onClick={() => {
                    const newLinks = [...links];
                    newLinks[index].isEditing = false;
                    setLinks(newLinks);
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{ flex: 1, cursor: "pointer" }}
                  onClick={() => {
                    const newLinks = [...links];
                    newLinks[index].isEditing = true;
                    setLinks(newLinks);
                  }}
                >
                  ☰ <strong>{link.title}</strong>
                  {link.isLive && (
                    <span style={{ color: "red", marginLeft: "6px" }}>
                      🔴 LIVE
                    </span>
                  )}
                </span>

                <span style={{ fontSize: "12px" }}>
                  Clicks: {link.clicks || 0}
                </span>
              </div>

              <div style={{ marginTop: "6px" }}>
                <button onClick={() => moveLink(index, index - 1)}>
                  ⬆
                </button>
                <button onClick={() => moveLink(index, index + 1)}>
                  ⬇
                </button>
                <button onClick={() => deleteLink(link._id)}>🗑</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default Admin;

