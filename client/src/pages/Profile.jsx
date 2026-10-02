import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { token, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/users/me', token);
        setProfile(data);
        setEditName(data.name || '');
        setEditBio(data.bio || '');
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    if (!editName.trim()) {
      setSaveError('Name is required.');
      return;
    }

    if (editName.trim().length > 80) {
      setSaveError('Name must be 80 characters or fewer.');
      return;
    }

    if (editBio.trim().length > 500) {
      setSaveError('Bio must be 500 characters or fewer.');
      return;
    }

    setSaving(true);
    try {
      const data = await api.put('/users/me', { name: editName.trim(), bio: editBio.trim() }, token);
      setProfile(data);
      updateUser(data);
      setEditing(false);
      setSaveSuccess('Profile updated successfully.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(profile.name || '');
    setEditBio(profile.bio || '');
    setEditing(false);
    setSaveError('');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="page-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '720px', margin: '2rem auto', padding: '0 1rem' }}>
      {saveSuccess && (
        <div className="alert alert-success py-2 mb-3" style={{ fontSize: '0.875rem' }}>
          <i className="bi bi-check-circle me-1"></i>
          {saveSuccess}
        </div>
      )}

      <div className="card p-4">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">{getInitials(profile.name)}</div>
          <div>
            <h4 className="mb-1">{profile.name}</h4>
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              <i className="bi bi-envelope me-1"></i>
              {profile.email}
            </p>
          </div>
          {!editing && (
            <button
              className="btn btn-outline-primary btn-sm ms-auto"
              onClick={() => setEditing(true)}
              type="button"
            >
              <i className="bi bi-pencil me-1"></i>
              Edit
            </button>
          )}
        </div>

        {/* Edit Form */}
        {editing ? (
          <form onSubmit={handleSave}>
            {saveError && (
              <div className="alert alert-danger py-2" style={{ fontSize: '0.875rem' }}>
                <i className="bi bi-exclamation-circle me-1"></i>
                {saveError}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="edit-name" className="form-label">Name</label>
              <input
                id="edit-name"
                type="text"
                className="form-control"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={saving}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="edit-bio" className="form-label">Bio</label>
              <textarea
                id="edit-bio"
                className="form-control"
                rows="3"
                placeholder="Tell people about yourself..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                disabled={saving}
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={profile.email}
                disabled
                readOnly
              />
              <div className="form-text">Email cannot be changed.</div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Bio */}
            <div className="profile-section">
              <h6>About</h6>
              <p className="mb-0" style={{ fontSize: '0.95rem' }}>
                {profile.bio || <span className="text-muted fst-italic">No bio added yet.</span>}
              </p>
            </div>

            {/* Skills Offered */}
            <div className="profile-section">
              <h6>Skills I Can Teach</h6>
              {profile.skillsOffered && profile.skillsOffered.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {profile.skillsOffered.map((skill) => (
                    <span key={skill._id} className="badge-skill">
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted fst-italic mb-0" style={{ fontSize: '0.9rem' }}>
                  No skills added yet.
                </p>
              )}
            </div>

            {/* Skills Wanted */}
            <div className="profile-section">
              <h6>Skills I Want to Learn</h6>
              {profile.skillsWanted && profile.skillsWanted.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {profile.skillsWanted.map((skill) => (
                    <span key={skill._id} className="badge-skill badge-skill-accent">
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted fst-italic mb-0" style={{ fontSize: '0.9rem' }}>
                  No skills added yet.
                </p>
              )}
            </div>

            {/* Member Since */}
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-calendar3 me-1"></i>
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
