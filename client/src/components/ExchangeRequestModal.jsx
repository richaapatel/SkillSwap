import { useEffect, useState } from 'react';
import api from '../services/api';

const getFriendlyError = (message) => {
  if (!message) return 'We could not send your request. Please try again.';
  if (message.includes('already have a pending request')) return 'You already have a pending request for this skill with this person.';
  if (message.includes('yourself')) return 'You cannot request a skill exchange with yourself.';
  if (message.includes('does not offer')) return 'This person no longer offers that skill. Refresh the profile and try another skill.';
  if (message.includes('Access denied') || message.includes('token') || message.includes('expired')) return 'Your session has expired. Please log in again.';
  if (message === 'Server error.') return 'The request could not be sent right now. Please try again shortly.';
  return message;
};

const ExchangeRequestModal = ({ teacher, skills, token, onClose, onSuccess }) => {
  const [selectedSkillId, setSelectedSkillId] = useState(skills[0]?._id || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdExchange, setCreatedExchange] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, submitting]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!selectedSkillId) {
      setError('Choose a skill you would like to learn.');
      return;
    }

    setSubmitting(true);
    try {
      const exchange = await api.post('/exchanges', {
        teacherId: teacher._id,
        skillId: selectedSkillId,
        message: message.trim(),
      }, token);
      setCreatedExchange(exchange);
      onSuccess?.(exchange);
    } catch (err) {
      setError(getFriendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="request-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <div className="request-modal" role="dialog" aria-modal="true" aria-labelledby="request-modal-title">
        <div className="request-modal-header">
          <div>
            <p className="page-kicker mb-1">Skill exchange request</p>
            <h2 id="request-modal-title">Request to learn from {teacher.name}</h2>
          </div>
          <button type="button" className="btn-close" onClick={onClose} disabled={submitting} aria-label="Close request form"></button>
        </div>

        {createdExchange ? (
          <div className="request-success-state">
            <div className="request-success-icon"><i className="bi bi-check2"></i></div>
            <h3>Request sent</h3>
            <p>Your request to learn <strong>{createdExchange.skill?.name || skills.find((skill) => skill._id === selectedSkillId)?.name}</strong> is now pending.</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="alert alert-danger py-2 small" role="alert"><i className="bi bi-exclamation-circle me-1"></i>{error}</div>}
            <div className="request-intro">
              <i className="bi bi-arrow-left-right"></i>
              <p className="mb-0">Choose one of {teacher.name}&apos;s offered skills and include a short note so they know what you&apos;d like to learn.</p>
            </div>
            <div className="mb-3">
              <label htmlFor="request-skill" className="form-label">Skill to learn</label>
              <select id="request-skill" className="form-select" value={selectedSkillId} onChange={(event) => setSelectedSkillId(event.target.value)} disabled={submitting} required>
                {skills.map((skill) => <option key={skill._id} value={skill._id}>{skill.name}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="request-message" className="form-label">Message <span className="text-muted fw-normal">(optional)</span></label>
              <textarea id="request-message" className="form-control" rows="4" maxLength="500" placeholder="What would you like to learn?" value={message} onChange={(event) => setMessage(event.target.value)} disabled={submitting}></textarea>
              <div className="form-text text-end">{message.length}/500</div>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting || !selectedSkillId}>
                {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</> : <><i className="bi bi-send me-2"></i>Send request</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ExchangeRequestModal;
