import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <h1>
            Learn something.<br />
            <span style={{ color: 'var(--color-primary)' }}>Teach something.</span>
          </h1>
          <p className="lead">
            SkillSwap connects people who want to learn with people who love to teach.
            Share your expertise, pick up new skills, and grow together.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            {isAuthenticated ? (
              <Link to="/profile" className="btn btn-primary btn-lg px-4">
                Go to Profile
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg px-4">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline-primary btn-lg px-4">
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mb-5">
        <h2 className="text-center mb-2" style={{ fontSize: '1.5rem' }}>How SkillSwap Works</h2>
        <p className="text-center text-muted mb-4" style={{ fontSize: '0.95rem' }}>Three simple steps to start exchanging knowledge</p>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <i className="bi bi-person-plus"></i>
              </div>
              <h5>Create Your Profile</h5>
              <p>Sign up and list the skills you can teach and the ones you want to learn.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: 'rgba(6, 214, 160, 0.1)', color: 'var(--color-accent)' }}>
                <i className="bi bi-search"></i>
              </div>
              <h5>Discover People</h5>
              <p>Browse users who offer what you need or want what you know. Find your match.</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: 'rgba(239, 71, 111, 0.1)', color: 'var(--color-danger)' }}>
                <i className="bi bi-arrow-left-right"></i>
              </div>
              <h5>Exchange Skills</h5>
              <p>Send a request, connect, and start learning from each other.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="container">
          <div className="cta-section">
            <h2>Ready to start learning?</h2>
            <p>Join SkillSwap today and connect with people who share your passion for knowledge.</p>
            <Link to="/register" className="btn btn-primary btn-lg px-4">
              Create Your Account
            </Link>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
