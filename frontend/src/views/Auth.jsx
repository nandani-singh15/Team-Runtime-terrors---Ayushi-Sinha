import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { FiMail, FiLock, FiUser, FiPhone, FiAlertCircle } from 'react-icons/fi';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const navigate = useNavigate();
  const { user, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } else {
      const res = await register(email, password, fullName, phoneNumber);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <GlassCard className="text-start">
          <h3 className="text-white fw-bold mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Safety Account'}
          </h3>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            {mode === 'login' 
              ? 'Enter credentials to access SwaSuraksha.' 
              : 'Sign up to start tracking safe routes and alerts.'}
          </p>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 border-0" style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#ea868f', fontSize: '0.85rem' }}>
              <FiAlertCircle /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.8rem' }}>FULL NAME</label>
                  <div className="position-relative">
                    <FiUser className="position-absolute text-muted" style={{ left: '16px', top: '15px' }} />
                    <input 
                      type="text" 
                      className="form-control premium-input ps-5" 
                      placeholder="e.g. Ayushi Sinha" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.8rem' }}>PHONE NUMBER</label>
                  <div className="position-relative">
                    <FiPhone className="position-absolute text-muted" style={{ left: '16px', top: '15px' }} />
                    <input 
                      type="tel" 
                      className="form-control premium-input ps-5" 
                      placeholder="e.g. +91 9999999999" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.8rem' }}>EMAIL ADDRESS</label>
              <div className="position-relative">
                <FiMail className="position-absolute text-muted" style={{ left: '16px', top: '15px' }} />
                <input 
                  type="email" 
                  className="form-control premium-input ps-5" 
                  placeholder="e.g. user@swasuraksha.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.8rem' }}>PASSWORD</label>
              <div className="position-relative">
                <FiLock className="position-absolute text-muted" style={{ left: '16px', top: '15px' }} />
                <input 
                  type="password" 
                  className="form-control premium-input ps-5" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-premium btn-premium-cyan w-100 justify-content-center py-3 mt-2"
              disabled={loading}
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: '0.85rem' }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <span 
                  onClick={() => navigate('/auth?mode=register')} 
                  className="text-cyan fw-bold"
                  style={{ color: '#00f2fe', cursor: 'pointer' }}
                >
                  Create one here
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span 
                  onClick={() => navigate('/auth?mode=login')} 
                  className="text-cyan fw-bold"
                  style={{ color: '#00f2fe', cursor: 'pointer' }}
                >
                  Login here
                </span>
              </>
            )}
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Auth;
