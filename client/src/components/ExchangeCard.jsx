import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const formatDate = (date) => {
  if (!date) return 'Date unavailable';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ExchangeCard = ({ exchange, direction, actionLoading, onAction }) => {
  const participant = direction === 'received' ? exchange.learner : exchange.teacher;
  const participantLabel = direction === 'received' ? 'Learner' : 'Teacher';
  const isPending = exchange.status === 'pending';
  const isAccepted = exchange.status === 'accepted';

  return (
    <article className="exchange-card card">
      <div className="card-body">
        <div className="exchange-card-topline">
          <div>
            <p className="exchange-card-label">{participantLabel}</p>
            <h3 className="exchange-card-person">{participant?.name || 'SkillSwap member'}</h3>
          </div>
          <StatusBadge status={exchange.status} />
        </div>

        <div className="exchange-skill-row">
          <div className="exchange-skill-icon"><i className="bi bi-lightbulb"></i></div>
          <div>
            <p className="exchange-card-label mb-1">Requested skill</p>
            <p className="exchange-card-skill mb-0">{exchange.skill?.name || 'Skill unavailable'}</p>
          </div>
        </div>

        {participant?.bio && <p className="exchange-card-bio">{participant.bio}</p>}
        <div className="exchange-message">
          <p className="exchange-card-label mb-1">Message</p>
          <p className={exchange.message ? 'mb-0' : 'text-muted fst-italic mb-0'}>{exchange.message || 'No message was included with this request.'}</p>
        </div>

        <div className="exchange-card-footer">
          <span className="exchange-date"><i className="bi bi-calendar3 me-1"></i>{formatDate(exchange.createdAt)}</span>
          <div className="exchange-actions">
            {direction === 'received' && isPending && (
              <>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onAction(exchange, 'reject')} disabled={actionLoading}>
                  {actionLoading === 'reject' ? <span className="spinner-border spinner-border-sm"></span> : 'Reject'}
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => onAction(exchange, 'accept')} disabled={actionLoading}>
                  {actionLoading === 'accept' ? <span className="spinner-border spinner-border-sm"></span> : 'Accept'}
                </button>
              </>
            )}
            {isAccepted && (
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => onAction(exchange, 'complete')} disabled={actionLoading}>
                {actionLoading === 'complete' ? <span className="spinner-border spinner-border-sm"></span> : 'Mark completed'}
              </button>
            )}
            <Link to={`/users/${participant?._id}`} className="btn btn-link btn-sm">View profile</Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ExchangeCard;
