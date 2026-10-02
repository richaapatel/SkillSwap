import { Link } from 'react-router-dom';
import SkillBadge from './SkillBadge';

const MatchCard = ({ match, onRequest }) => {
  const user = match.user;
  const offered = user.skillsOffered || [];
  const wanted = user.skillsWanted || [];
  const requestableSkills = match.skillsYouWant?.length > 0 ? match.skillsYouWant : offered;

  return (
    <article className="match-card card h-100">
      <div className="card-body d-flex flex-column">
        <div className="match-card-header">
          <div className="user-avatar" aria-hidden="true">
            {user.name?.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div className="min-w-0 flex-grow-1">
            <h3 className="match-card-name">{user.name}</h3>
            <p className="match-card-bio mb-0">{user.bio || 'A SkillSwap member ready to share knowledge.'}</p>
          </div>
          <div className="match-score" title="Score supplied by the matching service">
            <span>{match.score}</span>
            <small>match score</small>
          </div>
        </div>

        <div className="match-card-status">
          <span className={match.isTwoWayMatch ? 'match-direction match-direction-two-way' : 'match-direction'}>
            <i className={`bi ${match.isTwoWayMatch ? 'bi-arrow-left-right' : 'bi-arrow-right'} me-1`} aria-hidden="true"></i>
            {match.isTwoWayMatch ? 'Two-way match' : 'Shared learning interest'}
          </span>
        </div>

        <div className="match-card-skills">
          <div className="match-skill-group">
            <p className="match-skill-label"><i className="bi bi-easel2 me-1"></i>Offers</p>
            <div className="d-flex flex-wrap gap-2">
              {offered.length > 0 ? offered.map((skill) => <SkillBadge key={skill._id} skill={skill} />) : <span className="text-muted small">No offered skills listed</span>}
            </div>
          </div>
          <div className="match-skill-group">
            <p className="match-skill-label"><i className="bi bi-bookmark-heart me-1"></i>Wants to learn</p>
            <div className="d-flex flex-wrap gap-2">
              {wanted.length > 0 ? wanted.map((skill) => <SkillBadge key={skill._id} skill={skill} variant="wanted" />) : <span className="text-muted small">No learning goals listed</span>}
            </div>
          </div>
        </div>

        <div className="match-card-overlap">
          <p className="match-skill-label">Matching skills</p>
          <div className="d-flex flex-wrap gap-2">
            {match.skillsYouWant?.map((skill) => <span className="match-chip" key={`learn-${skill._id}`}><i className="bi bi-arrow-down-left me-1"></i>{skill.name}</span>)}
            {match.skillsTheyWant?.map((skill) => <span className="match-chip match-chip-accent" key={`teach-${skill._id}`}><i className="bi bi-arrow-up-right me-1"></i>{skill.name}</span>)}
            {(!match.skillsYouWant?.length && !match.skillsTheyWant?.length) && <span className="text-muted small">Your skill lists have room to overlap.</span>}
          </div>
        </div>

        <div className="match-card-actions mt-auto">
          <Link to={`/users/${user._id}`} className="btn btn-outline-primary btn-sm">View profile</Link>
          {requestableSkills.length > 0 && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onRequest({ teacher: user, skills: requestableSkills })}>
              <i className="bi bi-send me-1"></i>
              Request to learn
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default MatchCard;
