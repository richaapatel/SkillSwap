import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserCard from '../components/UserCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 9;

const Discover = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [offeredSkill, setOfferedSkill] = useState('');
  const [wantedSkill, setWantedSkill] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skillsError, setSkillsError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchSkills = async () => {
      try {
        const data = await api.get('/skills');
        if (active) setSkills(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setSkillsError(err.message || 'Skill filters are unavailable right now.');
      }
    };
    fetchSkills();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ page: pagination.page.toString(), limit: PAGE_SIZE.toString() });
    if (search) query.set('search', search);
    if (offeredSkill) query.set('offeredSkill', offeredSkill);
    if (wantedSkill) query.set('wantedSkill', wantedSkill);

    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/users?${query.toString()}`, token);
        if (active) {
          setUsers(data.users || []);
          setPagination(data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
        }
      } catch (err) {
        if (active) setError(err.message || 'We could not load the community.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchUsers();
    return () => { active = false; };
  }, [offeredSkill, pagination.page, search, token, wantedSkill]);

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setOfferedSkill('');
    setWantedSkill('');
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((current) => ({ ...current, page }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="stage-page">
      <div className="container">
        <header className="page-heading">
          <div>
            <p className="page-kicker">The SkillSwap community</p>
            <h1 className="page-title">Discover people to learn with</h1>
            <p className="page-intro">Find generous teachers, curious learners, and people whose skills complement your own.</p>
          </div>
          <div className="page-heading-stat">
            <span className="page-heading-stat-number">{pagination.total}</span>
            <span className="page-heading-stat-label">members to explore</span>
          </div>
        </header>

        <section className="filter-panel card mb-4" aria-label="Discover filters">
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-end">
              <div className="col-lg-5">
                <label htmlFor="discover-search" className="form-label">Search by name</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0"><i className="bi bi-search"></i></span>
                  <input id="discover-search" type="search" className="form-control border-start-0 ps-0" placeholder="Try a name" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <label htmlFor="offered-filter" className="form-label">They offer</label>
                <select id="offered-filter" className="form-select" value={offeredSkill} onChange={updateFilter(setOfferedSkill)} disabled={skills.length === 0}>
                  <option value="">Any skill</option>
                  {skills.map((skill) => <option key={skill._id} value={skill._id}>{skill.name}</option>)}
                </select>
              </div>
              <div className="col-md-6 col-lg-3">
                <label htmlFor="wanted-filter" className="form-label">They want to learn</label>
                <select id="wanted-filter" className="form-select" value={wantedSkill} onChange={updateFilter(setWantedSkill)} disabled={skills.length === 0}>
                  <option value="">Any skill</option>
                  {skills.map((skill) => <option key={skill._id} value={skill._id}>{skill.name}</option>)}
                </select>
              </div>
              <div className="col-lg-1 d-grid">
                <button type="submit" className="btn btn-primary" aria-label="Search users"><i className="bi bi-arrow-right"></i></button>
              </div>
            </div>
          </form>
          {(search || offeredSkill || wantedSkill) && (
            <div className="filter-summary">
              <span>Showing filtered results</span>
              <button type="button" className="btn btn-link btn-sm p-0" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
          {skillsError && <p className="inline-error mb-0 mt-3"><i className="bi bi-exclamation-circle me-1"></i>{skillsError}</p>}
        </section>

        <div className="section-heading-row mb-3">
          <div>
            <p className="page-kicker mb-1">Make a connection</p>
            <h2 className="section-title">People worth meeting</h2>
          </div>
          {!loading && <span className="result-count">Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span>}
        </div>

        {loading ? (
          <div className="loading-panel"><span className="spinner-border text-primary" role="status"></span><p>Finding people in the community...</p></div>
        ) : error ? (
          <div className="empty-state empty-state-error"><i className="bi bi-cloud-slash"></i><h3>We couldn&apos;t load the community</h3><p>{error}</p></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><i className="bi bi-people"></i><h3>No one matches those filters yet</h3><p>Try broadening your search, or check back as more people join SkillSwap.</p><button type="button" className="btn btn-outline-primary btn-sm" onClick={clearFilters}>Explore everyone</button></div>
        ) : (
          <div className="row g-4">
            {users.map((user) => <div className="col-md-6 col-xl-4" key={user._id}><UserCard user={user} /></div>)}
          </div>
        )}

        {!loading && !error && pagination.totalPages > 1 && (
          <nav className="mt-5" aria-label="User discovery pages">
            <ul className="pagination justify-content-center gap-1">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button type="button" className="page-link" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1} aria-label="Previous page"><i className="bi bi-chevron-left"></i></button>
              </li>
              {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
                <li className={`page-item ${pagination.page === page ? 'active' : ''}`} key={page}>
                  <button type="button" className="page-link" onClick={() => goToPage(page)}>{page}</button>
                </li>
              ))}
              <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                <button type="button" className="page-link" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} aria-label="Next page"><i className="bi bi-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        )}

        <div className="discover-footer-note">
          <i className="bi bi-shield-check me-2"></i>
          Profiles show only public information. Private account details stay private.
          <Link to="/skills" className="ms-2">Browse skills</Link>
        </div>
      </div>
    </div>
  );
};

export default Discover;
