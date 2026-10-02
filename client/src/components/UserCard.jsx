import { Link } from 'react-router-dom';
import SkillBadge from './SkillBadge';

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const UserCard = ({ user }) => {
  const offered = user.skillsOffered || [];
  const wanted = user.skillsWanted || [];

  return (
    <article className="user-card card h-100">
      <div className="card-body d-flex flex-column">
        <div className="user-card-header">
          <div className="user-avatar" aria-hidden="true">{getInitials(user.name)}</div>
          <div className="min-w-0">
            <h2 className="user-card-name">{user.name}</h2>
            <p className="user-card-role mb-0">SkillSwap member</p>
          </div>
        </div>

        <p className="user-card-bio">
          {user.bio || <span className="text-muted fst-italic">This member hasn&apos;t added a bio yet.</span>}
        </p>

        <div className="user-card-section">
          <div className="user-card-label">
            <i className="bi bi-easel2 me-1" aria-hidden="true"></i>
            Offers
          </div>
          {offered.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {offered.slice(0, 4).map((skill) => <SkillBadge key={skill._id} skill={skill} />)}
              {offered.length > 4 && <span className="skill-count">+{offered.length - 4} more</span>}
            </div>
          ) : (
            <span className="user-card-empty">No offered skills yet</span>
          )}
        </div>

        <div className="user-card-section">
          <div className="user-card-label">
            <i className="bi bi-bookmark-heart me-1" aria-hidden="true"></i>
            Wants to learn
          </div>
          {wanted.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {wanted.slice(0, 4).map((skill) => <SkillBadge key={skill._id} skill={skill} variant="wanted" />)}
              {wanted.length > 4 && <span className="skill-count">+{wanted.length - 4} more</span>}
            </div>
          ) : (
            <span className="user-card-empty">No learning goals yet</span>
          )}
        </div>

        <Link to={`/users/${user._id}`} className="btn btn-outline-primary btn-sm w-100 mt-auto">
          View profile
          <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
        </Link>
      </div>
    </article>
  );
};

export default UserCard;
