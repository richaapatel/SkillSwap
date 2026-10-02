import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExchangeCard from '../components/ExchangeCard';
import api from '../services/api';

const Exchanges = () => {
  const { token } = useAuth();
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState({ received: true, sent: true });
  const [errors, setErrors] = useState({ received: '', sent: '' });
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let active = true;
    const loadExchanges = async () => {
      const results = await Promise.allSettled([
        api.get('/exchanges/received', token),
        api.get('/exchanges/sent', token),
      ]);
      if (!active) return;
      const [receivedResult, sentResult] = results;
      if (receivedResult.status === 'fulfilled') setReceived(receivedResult.value || []);
      if (sentResult.status === 'fulfilled') setSent(sentResult.value || []);
      setErrors({
        received: receivedResult.status === 'rejected' ? (receivedResult.reason.message || 'Received requests could not be loaded.') : '',
        sent: sentResult.status === 'rejected' ? (sentResult.reason.message || 'Sent requests could not be loaded.') : '',
      });
      setLoading({ received: false, sent: false });
    };
    loadExchanges();
    return () => { active = false; };
  }, [token]);

  const handleAction = async (exchange, action) => {
    setActionLoading(`${exchange._id}-${action}`);
    setActionError('');
    try {
      const updatedExchange = await api.patch(`/exchanges/${exchange._id}/${action}`, {}, token);
      setReceived((current) => current.map((item) => item._id === updatedExchange._id ? updatedExchange : item));
      setSent((current) => current.map((item) => item._id === updatedExchange._id ? updatedExchange : item));
    } catch (err) {
      setActionError(err.message || 'We could not update this exchange.');
    } finally {
      setActionLoading('');
    }
  };

  const activeItems = activeTab === 'received' ? received : sent;
  const activeError = activeTab === 'received' ? errors.received : errors.sent;
  const activeLoading = activeTab === 'received' ? loading.received : loading.sent;

  return (
    <div className="stage-page exchanges-page">
      <div className="container">
        <header className="page-heading">
          <div>
            <p className="page-kicker">Your exchange desk</p>
            <h1 className="page-title">Skill exchange requests</h1>
            <p className="page-intro">Keep track of people you can learn from, people who want to learn from you, and the exchanges already underway.</p>
          </div>
          <div className="exchange-page-summary"><span><strong>{received.filter((item) => item.status === 'pending').length}</strong> incoming</span><span><strong>{sent.filter((item) => item.status === 'pending').length}</strong> sent</span></div>
        </header>

        {actionError && <div className="alert alert-danger page-alert" role="alert"><i className="bi bi-exclamation-circle me-2"></i>{actionError}</div>}

        <div className="exchange-tabs" role="tablist" aria-label="Exchange request lists">
          <button type="button" role="tab" aria-selected={activeTab === 'received'} className={`exchange-tab ${activeTab === 'received' ? 'active' : ''}`} onClick={() => setActiveTab('received')}>
            <i className="bi bi-inbox me-2"></i>Received Requests <span>{received.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'sent'} className={`exchange-tab ${activeTab === 'sent' ? 'active' : ''}`} onClick={() => setActiveTab('sent')}>
            <i className="bi bi-send me-2"></i>Sent Requests <span>{sent.length}</span>
          </button>
        </div>

        <section className="exchange-list-section" aria-live="polite">
          <div className="section-heading-row mb-3">
            <div><p className="page-kicker mb-1">{activeTab === 'received' ? 'People reaching out' : 'Your learning plans'}</p><h2 className="section-title">{activeTab === 'received' ? 'Requests to learn from you' : 'Requests you have sent'}</h2></div>
            {!activeLoading && !activeError && <span className="result-count">{activeItems.length} request{activeItems.length === 1 ? '' : 's'}</span>}
          </div>

          {activeLoading ? (
            <div className="loading-panel"><span className="spinner-border text-primary" role="status"></span><p>Loading your exchange requests...</p></div>
          ) : activeError ? (
            <div className="empty-state empty-state-error"><i className="bi bi-cloud-slash"></i><h3>Requests are unavailable</h3><p>{activeError}</p></div>
          ) : activeItems.length === 0 ? (
            <div className="empty-state"><i className={`bi ${activeTab === 'received' ? 'bi-inbox' : 'bi-send'}`}></i><h3>{activeTab === 'received' ? 'No received requests yet' : 'No sent requests yet'}</h3><p>{activeTab === 'received' ? 'Incoming requests will appear here when someone wants to learn from one of your offered skills.' : 'Requests you send to other SkillSwap members will appear here while you build your learning path.'}</p>{activeTab === 'received' ? <Link to="/skills" className="btn btn-outline-primary btn-sm">Review offered skills</Link> : <Link to="/discover" className="btn btn-primary btn-sm">Discover people</Link>}</div>
          ) : (
            <div className="exchange-list">{activeItems.map((exchange) => <ExchangeCard key={exchange._id} exchange={exchange} direction={activeTab} actionLoading={actionLoading.startsWith(`${exchange._id}-`) ? actionLoading.split('-').pop() : ''} onAction={handleAction} />)}</div>
          )}
        </section>

        <div className="exchange-help-note"><i className="bi bi-info-circle me-2"></i>Pending requests can be accepted or rejected by the teacher. Accepted exchanges can be marked completed by either participant.</div>
      </div>
    </div>
  );
};

export default Exchanges;
