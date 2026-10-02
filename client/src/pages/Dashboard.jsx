import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import MatchCard from '../components/MatchCard';
import ExchangeCard from '../components/ExchangeCard';
import ExchangeRequestModal from '../components/ExchangeRequestModal';
import api from '../services/api';

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
};

const Dashboard = () => {
  const { user: authUser, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState({ profile: true, matches: true, received: true, sent: true });
  const [errors, setErrors] = useState({ profile: '', matches: '', received: '', sent: '' });
  const [requestDetails, setRequestDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const results = await Promise.allSettled([
        api.get('/users/me', token),
        api.get('/matches?page=1&limit=3', token),
        api.get('/exchanges/received', token),
        api.get('/exchanges/sent', token),
      ]);

      if (!active) return;

      const [profileResult, matchesResult, receivedResult, sentResult] = results;
      if (profileResult.status === 'fulfilled') setProfile(profileResult.value);
      if (matchesResult.status === 'fulfilled') setMatches(matchesResult.value.matches || []);
      if (receivedResult.status === 'fulfilled') setReceived(receivedResult.value || []);
      if (sentResult.status === 'fulfilled') setSent(sentResult.value || []);

      setErrors({
        profile: profileResult.status === 'rejected' ? (profileResult.reason.message || 'Profile summary is unavailable.') : '',
        matches: matchesResult.status === 'rejected' ? (matchesResult.reason.message || 'Matches are unavailable right now.') : '',
        received: receivedResult.status === 'rejected' ? (receivedResult.reason.message || 'Received requests are unavailable right now.') : '',
        sent: sentResult.status === 'rejected' ? (sentResult.reason.message || 'Sent requests are unavailable right now.') : '',
      });
      setLoading({ profile: false, matches: false, received: false, sent: false });
    };

    loadDashboard();
    return () => { active = false; };
  }, [token]);

  const handleRequestSuccess = (exchange) => {
    setSent((current) => [exchange, ...current]);
  };

  const handleExchangeAction = async (exchange, action) => {
    setActionLoading(`${exchange._id}-${action}`);
    setActionError('');
    try {
      const updatedExchange = await api.patch(`/exchanges/${exchange._id}/${action}`, {}, token);
      setReceived((current) => current.map((item) => item._id === updatedExchange._id ? updatedExchange : item));
      setSent((current) => current.map((item) => item._id === updatedExchange._id ? updatedExchange : item));
    } catch (err) {
      setActionError(err.message || 'We could not update this request.');
    } finally {
      setActionLoading('');
    }
  };

  const currentProfile = profile || authUser || {};
  const offered = currentProfile.skillsOffered || [];
  const wanted = currentProfile.skillsWanted || [];
  const pendingReceived = received.filter((exchange) => exchange.status === 'pending').length;
  const pendingSent = sent.filter((exchange) => exchange.status === 'pending').length;

  return (
    <div className="stage-page dashboard-page">
      <div className="container">
        <header className="dashboard-welcome">
          <div>
            <p className="page-kicker">Your SkillSwap space</p>
            <h1 className="page-title">Welcome back, {currentProfile.name?.split(' ')[0] || 'there'}</h1>
            <p className="page-intro">Keep your skills current, find people to learn with, and stay close to your exchanges.</p>
          </div>
          <Link to="/profile" className="btn btn-outline-primary"><i className="bi bi-person-circle me-2"></i>View profile</Link>
        </header>

        {actionError && <div className="alert alert-danger page-alert" role="alert"><i className="bi bi-exclamation-circle me-2"></i>{actionError}</div>}

        <div className="dashboard-grid">
          <section className="dashboard-profile-card card" aria-labelledby="dashboard-profile-heading">
            <div className="card-body">
              <div className="dashboard-profile-top">
                <div className="profile-public-avatar" aria-hidden="true">{getInitials(currentProfile.name)}</div>
                <div className="min-w-0">
                  <p className="page-kicker mb-1">Profile summary</p>
                  <h2 id="dashboard-profile-heading">{currentProfile.name || 'Your profile'}</h2>
                  <p className="text-muted mb-0 small">{currentProfile.bio || 'Add a bio so people know what brings you to SkillSwap.'}</p>
                </div>
              </div>
              {loading.profile ? (
                <div className="dashboard-inline-loading"><span className="spinner-border spinner-border-sm text-primary"></span> Loading profile details...</div>
              ) : errors.profile ? (
                <p className="inline-error mt-3 mb-0"><i className="bi bi-exclamation-circle me-1"></i>{errors.profile}</p>
              ) : (
                <div className="dashboard-profile-stats">
                  <div><strong>{offered.length}</strong><span>offered</span></div>
                  <div><strong>{wanted.length}</strong><span>want to learn</span></div>
                  <div><strong>{pendingReceived + pendingSent}</strong><span>pending</span></div>
                </div>
              )}
              <div className="d-flex gap-2 flex-wrap mt-4">
                <Link to="/profile" className="btn btn-outline-primary btn-sm">Edit profile</Link>
                <Link to="/skills" className="btn btn-primary btn-sm">Manage skills</Link>
              </div>
            </div>
          </section>

          <section className="dashboard-skills-card card" aria-labelledby="dashboard-skills-heading">
            <div className="card-body">
              <div className="section-heading-row mb-3">
                <div><p className="page-kicker mb-1">Your learning map</p><h2 id="dashboard-skills-heading" className="section-title">Skills at a glance</h2></div>
                <Link to="/skills" className="small">Manage</Link>
              </div>
              <div className="dashboard-skill-column">
                <p className="dashboard-skill-heading"><i className="bi bi-easel2 me-2"></i>Skills I offer</p>
                {loading.profile ? <div className="dashboard-placeholder-line"></div> : offered.length > 0 ? <div className="d-flex flex-wrap gap-2">{offered.slice(0, 5).map((skill) => <SkillBadge key={skill._id} skill={skill} />)}{offered.length > 5 && <span className="skill-count">+{offered.length - 5} more</span>}</div> : <p className="text-muted small mb-0">Add a skill you can teach to help people find you.</p>}
              </div>
              <div className="dashboard-skill-column">
                <p className="dashboard-skill-heading"><i className="bi bi-bookmark-heart me-2"></i>Skills I want to learn</p>
                {loading.profile ? <div className="dashboard-placeholder-line"></div> : wanted.length > 0 ? <div className="d-flex flex-wrap gap-2">{wanted.slice(0, 5).map((skill) => <SkillBadge key={skill._id} skill={skill} variant="wanted" />)}{wanted.length > 5 && <span className="skill-count">+{wanted.length - 5} more</span>}</div> : <p className="text-muted small mb-0">Choose learning goals to improve your recommendations.</p>}
              </div>
            </div>
          </section>
        </div>

        <section className="dashboard-section" aria-labelledby="dashboard-matches-heading">
          <div className="section-heading-row mb-3">
            <div><p className="page-kicker mb-1">Based on your skills</p><h2 id="dashboard-matches-heading" className="section-title">Recommended matches</h2></div>
            <Link to="/discover" className="btn btn-outline-primary btn-sm">Discover people</Link>
          </div>
          {loading.matches ? (
            <div className="dashboard-loading-row"><span className="spinner-border spinner-border-sm text-primary"></span> Finding people whose skills connect with yours...</div>
          ) : errors.matches ? (
            <div className="dashboard-section-error"><i className="bi bi-exclamation-circle me-2"></i>{errors.matches}</div>
          ) : matches.length === 0 ? (
            <div className="dashboard-empty-card"><i className="bi bi-compass"></i><div><h3>Your next match starts with your skills</h3><p>Add offered and wanted skills so SkillSwap can find meaningful overlaps.</p></div><Link to="/skills" className="btn btn-primary btn-sm ms-auto">Manage skills</Link></div>
          ) : (
            <div className="row g-4">{matches.map((match) => <div className="col-lg-4" key={match.user._id}><MatchCard match={match} onRequest={setRequestDetails} /></div>)}</div>
          )}
        </section>

        <section className="dashboard-section" aria-labelledby="dashboard-activity-heading">
          <div className="section-heading-row mb-3">
            <div><p className="page-kicker mb-1">Stay in the loop</p><h2 id="dashboard-activity-heading" className="section-title">Exchange activity</h2></div>
            <Link to="/exchanges" className="btn btn-outline-primary btn-sm">View requests</Link>
          </div>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="dashboard-activity-panel">
                <div className="dashboard-activity-heading"><div><h3>Received requests</h3><p>People who want to learn from you.</p></div><span className="activity-count">{pendingReceived} pending</span></div>
                {loading.received ? <div className="dashboard-loading-row"><span className="spinner-border spinner-border-sm text-primary"></span> Loading requests...</div> : errors.received ? <div className="dashboard-section-error">{errors.received}</div> : received.length === 0 ? <div className="dashboard-mini-empty"><i className="bi bi-inbox"></i><p>No incoming requests yet. Keep your offered skills up to date so people can find you.</p></div> : <div className="dashboard-exchange-list">{received.slice(0, 2).map((exchange) => <ExchangeCard key={exchange._id} exchange={exchange} direction="received" actionLoading={actionLoading.startsWith(`${exchange._id}-`) ? actionLoading.split('-').pop() : ''} onAction={handleExchangeAction} />)}</div>}
                {received.length > 2 && <Link to="/exchanges" className="dashboard-list-link">View all received requests <i className="bi bi-arrow-right"></i></Link>}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="dashboard-activity-panel">
                <div className="dashboard-activity-heading"><div><h3>Sent requests</h3><p>Requests you have sent to others.</p></div><span className="activity-count">{pendingSent} pending</span></div>
                {loading.sent ? <div className="dashboard-loading-row"><span className="spinner-border spinner-border-sm text-primary"></span> Loading requests...</div> : errors.sent ? <div className="dashboard-section-error">{errors.sent}</div> : sent.length === 0 ? <div className="dashboard-mini-empty"><i className="bi bi-send"></i><p>No sent requests yet. Explore the community when you are ready to learn.</p><Link to="/discover" className="small">Discover people</Link></div> : <div className="dashboard-exchange-list">{sent.slice(0, 2).map((exchange) => <ExchangeCard key={exchange._id} exchange={exchange} direction="sent" actionLoading={actionLoading.startsWith(`${exchange._id}-`) ? actionLoading.split('-').pop() : ''} onAction={handleExchangeAction} />)}</div>}
                {sent.length > 2 && <Link to="/exchanges" className="dashboard-list-link">View all sent requests <i className="bi bi-arrow-right"></i></Link>}
              </div>
            </div>
          </div>
        </section>

        <section className="quick-actions" aria-labelledby="quick-actions-heading">
          <div><p className="page-kicker mb-1">Keep moving</p><h2 id="quick-actions-heading" className="section-title">Useful next steps</h2></div>
          <div className="quick-action-links"><Link to="/skills" className="quick-action-link"><i className="bi bi-grid-3x3-gap"></i><span>Manage skills</span><i className="bi bi-arrow-right ms-auto"></i></Link><Link to="/discover" className="quick-action-link"><i className="bi bi-compass"></i><span>Discover people</span><i className="bi bi-arrow-right ms-auto"></i></Link><Link to="/exchanges" className="quick-action-link"><i className="bi bi-arrow-left-right"></i><span>Review requests</span><i className="bi bi-arrow-right ms-auto"></i></Link></div>
        </section>
      </div>

      {requestDetails && (
        <ExchangeRequestModal
          teacher={requestDetails.teacher}
          skills={requestDetails.skills}
          token={token}
          onClose={() => setRequestDetails(null)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
