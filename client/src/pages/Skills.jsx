import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import SkillCard from '../components/SkillCard';
import api from '../services/api';

const emptySkillLists = { offered: [], wanted: [] };

const Skills = () => {
  const { isAuthenticated, token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [mySkills, setMySkills] = useState(emptySkillLists);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [skillsError, setSkillsError] = useState('');
  const [mySkillsLoading, setMySkillsLoading] = useState(false);
  const [mySkillsError, setMySkillsError] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [createForm, setCreateForm] = useState({ name: '', description: '', category: '' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchSkills = async () => {
      setLoading(true);
      setSkillsError('');
      try {
        const data = await api.get('/skills');
        if (active) setSkills(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setSkillsError(err.message || 'We could not load the skill library.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSkills();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    if (!isAuthenticated) {
      return () => { active = false; };
    }

    const fetchMySkills = async () => {
      setMySkillsLoading(true);
      setMySkillsError('');
      try {
        const data = await api.get('/users/me/skills', token);
        if (active) {
          setMySkills({
            offered: data.offered || [],
            wanted: data.wanted || [],
          });
        }
      } catch (err) {
        if (active) setMySkillsError(err.message || 'We could not load your skill lists.');
      } finally {
        if (active) setMySkillsLoading(false);
      }
    };

    fetchMySkills();
    return () => { active = false; };
  }, [isAuthenticated, token]);

  const categories = useMemo(() => (
    [...new Set(skills.map((skill) => skill.category).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  ), [skills]);

  const filteredSkills = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return skills.filter((skill) => {
      const matchesSearch = !normalizedSearch
        || skill.name?.toLowerCase().includes(normalizedSearch)
        || skill.description?.toLowerCase().includes(normalizedSearch);
      const matchesCategory = !category || skill.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, search, skills]);

  const offeredIds = useMemo(() => new Set(mySkills.offered.map((skill) => skill._id)), [mySkills.offered]);
  const wantedIds = useMemo(() => new Set(mySkills.wanted.map((skill) => skill._id)), [mySkills.wanted]);

  const handleManageSkill = async ({ action, skillId, type }) => {
    const key = `${type}-${skillId}`;
    setBusyKey(key);
    setFeedback({ type: '', message: '' });

    try {
      const endpoint = `/users/me/skills/${type}/${skillId}`;
      const data = action === 'add'
        ? await api.post(endpoint, {}, token)
        : await api.delete(endpoint, token);

      setMySkills((current) => ({
        ...current,
        [type]: data[type] || current[type],
      }));
      setFeedback({
        type: 'success',
        message: action === 'add' ? 'Skill added to your profile.' : 'Skill removed from your profile.',
      });
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'We could not update your skills.' });
    } finally {
      setBusyKey('');
    }
  };

  const handleCreateSkill = async (event) => {
    event.preventDefault();
    setCreateError('');
    setFeedback({ type: '', message: '' });

    const name = createForm.name.trim();
    if (!name) {
      setCreateError('Skill name is required.');
      return;
    }

    setCreating(true);
    try {
      const createdSkill = await api.post('/skills', {
        name,
        description: createForm.description.trim(),
        category: createForm.category.trim(),
      }, token);
      setSkills((current) => [createdSkill, ...current.filter((skill) => skill._id !== createdSkill._id)]);
      setCreateForm({ name: '', description: '', category: '' });
      setFeedback({ type: 'success', message: 'Your new skill is now part of the SkillSwap library.' });
    } catch (err) {
      setCreateError(err.message || 'We could not create that skill.');
    } finally {
      setCreating(false);
    }
  };

  const removeSkill = (type) => (skill) => handleManageSkill({ action: 'remove', skillId: skill._id, type });

  return (
    <div className="stage-page">
      <div className="container">
        <header className="page-heading">
          <div>
            <p className="page-kicker">The skill library</p>
            <h1 className="page-title">Find your next skill to share</h1>
            <p className="page-intro">Explore what the community knows, then shape your profile around what you can teach and what you want to learn.</p>
          </div>
          <div className="page-heading-stat">
            <span className="page-heading-stat-number">{skills.length}</span>
            <span className="page-heading-stat-label">skills in the library</span>
          </div>
        </header>

        {feedback.message && (
          <div className={`alert alert-${feedback.type} page-alert`} role="status">
            <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
            {feedback.message}
          </div>
        )}

        {isAuthenticated ? (
          <section className="skill-manager-grid mb-5" aria-label="Your skills">
            <div className="skill-manager-card">
              <div className="skill-manager-heading">
                <div className="section-icon section-icon-primary"><i className="bi bi-easel2"></i></div>
                <div>
                  <h2>Skills I offer</h2>
                  <p>Show the community what you can teach.</p>
                </div>
              </div>
              {mySkillsLoading ? (
                <div className="small-loading"><span className="spinner-border spinner-border-sm text-primary"></span> Loading your skills...</div>
              ) : mySkillsError ? (
                <p className="inline-error mb-0"><i className="bi bi-exclamation-circle me-1"></i>{mySkillsError}</p>
              ) : mySkills.offered.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {mySkills.offered.map((skill) => <SkillBadge key={skill._id} skill={skill} removable onRemove={removeSkill('offered')} />)}
                </div>
              ) : (
                <p className="skill-manager-empty mb-0">You haven&apos;t added any teaching skills yet. Pick one from the library below.</p>
              )}
            </div>

            <div className="skill-manager-card">
              <div className="skill-manager-heading">
                <div className="section-icon section-icon-accent"><i className="bi bi-bookmark-heart"></i></div>
                <div>
                  <h2>Skills I want to learn</h2>
                  <p>Keep track of your next learning goals.</p>
                </div>
              </div>
              {mySkillsLoading ? (
                <div className="small-loading"><span className="spinner-border spinner-border-sm text-primary"></span> Loading your skills...</div>
              ) : mySkillsError ? (
                <p className="inline-error mb-0"><i className="bi bi-exclamation-circle me-1"></i>{mySkillsError}</p>
              ) : mySkills.wanted.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {mySkills.wanted.map((skill) => <SkillBadge key={skill._id} skill={skill} variant="wanted" removable onRemove={removeSkill('wanted')} />)}
                </div>
              ) : (
                <p className="skill-manager-empty mb-0">No learning goals yet. Add a skill you&apos;d love to explore.</p>
              )}
            </div>
          </section>
        ) : (
          <div className="auth-callout mb-5">
            <div><i className="bi bi-stars"></i></div>
            <div>
              <h2>Make the library yours</h2>
              <p className="mb-0">Create a free profile to save skills you offer and want to learn.</p>
            </div>
            <Link to="/login" className="btn btn-primary btn-sm ms-auto">Log in to continue</Link>
          </div>
        )}

        <div className="row g-4 align-items-start">
          <div className="col-lg-8">
            <section aria-labelledby="browse-skills-heading">
              <div className="section-heading-row">
                <div>
                  <p className="page-kicker mb-1">Browse the library</p>
                  <h2 id="browse-skills-heading" className="section-title">Available skills</h2>
                </div>
                <span className="result-count">{filteredSkills.length} result{filteredSkills.length === 1 ? '' : 's'}</span>
              </div>

              <div className="skills-toolbar card mb-4">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0"><i className="bi bi-search"></i></span>
                  <input
                    type="search"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search by skill or description"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Search skills"
                  />
                </div>
                <select
                  className="form-select"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label="Filter skills by category"
                >
                  <option value="">All categories</option>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              {loading ? (
                <div className="loading-panel"><span className="spinner-border text-primary" role="status"></span><p>Loading the skill library...</p></div>
              ) : skillsError ? (
                <div className="empty-state empty-state-error"><i className="bi bi-cloud-slash"></i><h3>We couldn&apos;t load the library</h3><p>{skillsError}</p></div>
              ) : filteredSkills.length === 0 ? (
                <div className="empty-state"><i className="bi bi-search"></i><h3>No skills match that search</h3><p>Try a different term or clear the category filter to see more of the library.</p><button type="button" className="btn btn-outline-primary btn-sm" onClick={() => { setSearch(''); setCategory(''); }}>Clear filters</button></div>
              ) : (
                <div className="row g-3">
                  {filteredSkills.map((skill) => (
                    <div className="col-md-6" key={skill._id}>
                      <SkillCard
                        skill={skill}
                        isAuthenticated={isAuthenticated}
                        isOffered={offeredIds.has(skill._id)}
                        isWanted={wantedIds.has(skill._id)}
                        busyKey={busyKey}
                        onManage={handleManageSkill}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {isAuthenticated && (
            <div className="col-lg-4">
              <section className="create-skill-card card" aria-labelledby="create-skill-heading">
                <div className="card-body">
                  <div className="section-icon section-icon-primary mb-3"><i className="bi bi-plus-lg"></i></div>
                  <p className="page-kicker mb-1">Can&apos;t find it?</p>
                  <h2 id="create-skill-heading" className="h4 mb-2">Add a new skill</h2>
                  <p className="text-muted small mb-4">Create a useful skill for everyone in the community. It will be added to the shared library.</p>
                  {createError && <div className="alert alert-danger py-2 small">{createError}</div>}
                  <form onSubmit={handleCreateSkill} noValidate>
                    <div className="mb-3">
                      <label htmlFor="skill-name" className="form-label">Name</label>
                      <input id="skill-name" type="text" className="form-control" placeholder="e.g. Public speaking" value={createForm.name} onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} disabled={creating} required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="skill-category" className="form-label">Category</label>
                      <input id="skill-category" type="text" className="form-control" placeholder="e.g. Communication" value={createForm.category} onChange={(event) => setCreateForm({ ...createForm, category: event.target.value })} disabled={creating} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="skill-description" className="form-label">Description</label>
                      <textarea id="skill-description" className="form-control" rows="3" placeholder="What will people learn?" value={createForm.description} onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })} disabled={creating}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={creating}>
                      {creating ? <><span className="spinner-border spinner-border-sm me-2"></span>Adding skill...</> : <><i className="bi bi-plus-lg me-2"></i>Add skill</>}
                    </button>
                  </form>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Skills;
