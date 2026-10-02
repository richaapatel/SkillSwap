import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-md navbar-light sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-arrow-left-right me-2" style={{ color: 'var(--color-primary)' }}></i>
          SkillSwap
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-md-center gap-1">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link" to="/skills">
                <i className="bi bi-grid-3x3-gap me-1"></i>
                Skills
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/discover">
                <i className="bi bi-compass me-1"></i>
                Discover
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/exchanges">
                    <i className="bi bi-arrow-left-right me-1"></i>
                    Requests
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    <i className="bi bi-person-circle me-1"></i>
                    {user?.name?.split(' ')[0] || 'Profile'}
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-secondary btn-sm ms-md-2"
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm ms-md-2" to="/register">
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
