import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import api from '../services/api';

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/users/${userId}`);
        if (active) setProfile(data);
      } catch (err) {
        if (active) setError(err.message || 'We could not load this profile.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();
    return () => { active = false; };
  }, [userId]);

  if (loading) {
    return <div className="page-spinner"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading profile...</span></div></div>;
  }

  if (error) {
    return (
      <div className="stage-page">
        <div className="container narrow-container">
          <div className="empty-state empty-state-error"><i className="bi bi-person-x"></i><h1>Profile unavailable</h1><p>{error}</p><Link to="/discover" className="btn btn-primary btn-sm">Back to discover</Link></div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profile?._id;
  const offered = profile.skillsOffered || [];
  const wanted = profile.skillsWanted || [];

  return (
    <div className="stage-page">
      <div className="container narrow-container">
        <Link to="/discover" className="back-link"><i className="bi bi-arrow-left me-2"></i>Back to discover</Link>

        <article className="profile-public-card card">
          <div className="profile-public-header">
            <div className="profile-public-avatar" aria-hidden="true">{getInitials(profile.name)}</div>
            <div className="flex-grow-1">
              <p className="page-kicker mb-1">Community profile</p>
              <h1>{profile.name}</h1>
              <p className="profile-public-tagline mb-0">Here to share knowledge and keep learning.</p>
            </div>
            <div className="profile-public-actions">
              {isOwnProfile ? (
                <Link to="/profile" className="btn btn-outline-primary btn-sm">Edit your profile</Link>
              ) : (
                <button type="button" className="btn btn-primary btn-sm" disabled title="Exchange requests arrive in a future stage.">
                  <i className="bi bi-arrow-left-right me-2"></i>
                  Request Skill Exchange — Coming Soon
                </button>
              )}
            </div>
          </div>

          <div className="profile-public-about">
            <p className="profile-section-label">About</p>
            <p className={profile.bio ? 'mb-0' : 'text-muted fst-italic mb-0'}>{profile.bio || 'This member has not added a bio yet.'}</p>
          </div>

          <div className="profile-public-skills">
            <div className="profile-public-skill-section">
              <p className="profile-section-label"><i className="bi bi-easel2 me-2"></i>Skills offered</p>
              {offered.length > 0 ? <div className="d-flex flex-wrap gap-2">{offered.map((skill) => <SkillBadge key={skill._id} skill={skill} />)}</div> : <p className="text-muted fst-italic mb-0">No offered skills yet.</p>}
            </div>
            <div className="profile-public-skill-section">
              <p className="profile-section-label"><i className="bi bi-bookmark-heart me-2"></i>Wants to learn</p>
              {wanted.length > 0 ? <div className="d-flex flex-wrap gap-2">{wanted.map((skill) => <SkillBadge key={skill._id} skill={skill} variant="wanted" />)}</div> : <p className="text-muted fst-italic mb-0">No learning goals yet.</p>}
            </div>
          </div>

          {!isOwnProfile && <p className="profile-public-note mb-0"><i className="bi bi-info-circle me-2"></i>Exchange requests will be available in a future SkillSwap update.</p>}
        </article>
      </div>
    </div>
  );
};

export default UserProfile;
