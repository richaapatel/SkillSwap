import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const passwordRequirements = [
  { key: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { key: 'uppercase', label: 'At least one uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { key: 'lowercase', label: 'At least one lowercase letter', test: (value) => /[a-z]/.test(value) },
  { key: 'number', label: 'At least one number', test: (value) => /\d/.test(value) },
  { key: 'special', label: 'At least one special character', test: (value) => /[^A-Za-z0-9\s]/.test(value) },
];

const getPasswordErrors = (value) => passwordRequirements
  .filter((requirement) => !requirement.test(value))
  .map((requirement) => requirement.label);

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (normalizedName.length > 80) {
      setError('Name must be 80 characters or fewer.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length > 128) {
      setError('Password must be 128 characters or fewer.');
      return;
    }

    const passwordErrors = getPasswordErrors(password);
    if (passwordErrors.length > 0) {
      setError(`Password requirements not met: ${passwordErrors.join(', ')}.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(normalizedName, normalizedEmail, password);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 className="card-title text-center">Create your account</h2>
        <p className="card-subtitle text-center">Join SkillSwap and start exchanging knowledge</p>

        {error && (
          <div className="alert alert-danger py-2" role="alert" style={{ fontSize: '0.875rem' }}>
            <i className="bi bi-exclamation-circle me-1"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="register-name" className="form-label">Full Name</label>
            <input
              id="register-name"
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="register-email" className="form-label">Email</label>
            <input
              id="register-email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="register-password" className="form-label">Password</label>
            <input
              id="register-password"
              type="password"
              className="form-control"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required
            />
            <ul className="list-unstyled form-text mb-0" aria-label="Password requirements">
              {passwordRequirements.map((requirement) => {
                const meetsRequirement = requirement.test(password);
                return (
                  <li key={requirement.key} className={meetsRequirement ? 'text-success' : ''}>
                    <i className={`bi ${meetsRequirement ? 'bi-check-circle' : 'bi-circle'} me-1`} aria-hidden="true"></i>
                    {requirement.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mb-4">
            <label htmlFor="register-confirm" className="form-label">Confirm Password</label>
            <input
              id="register-confirm"
              type="password"
              className="form-control"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-muted mb-0" style={{ fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
