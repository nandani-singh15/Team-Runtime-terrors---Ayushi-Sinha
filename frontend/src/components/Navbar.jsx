import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiMap, FiShield, FiSliders, FiHelpCircle } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-premium sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span style={{
            fontSize: '1.6rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #00f2fe, #9b51e0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}>
            SwaSuraksha
          </span>
        </Link>

        <button 
          className="navbar-toggler" 
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
          <ul className="navbar-nav ms-auto align-items-center gap-3 mt-3 mt-lg-0">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-2" to="/dashboard">
                    <FiShield /> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-2" to="/route-ai">
                    <FiMap /> Route AI
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-2" to="/profile">
                    <FiUser /> QR Card
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-2" to="/contacts">
                    <FiSliders /> Contacts
                  </Link>
                </li>
                {user.role === 'ROLE_ADMIN' && (
                  <li className="nav-item">
                    <Link className="nav-link text-warning d-flex align-items-center gap-2" to="/admin">
                      <FiSliders /> Admin Panel
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-2" to="/support">
                    <FiHelpCircle /> Support
                  </Link>
                </li>
                <li className="nav-item ms-lg-3">
                  <button 
                    onClick={handleLogout}
                    className="btn btn-premium btn-premium-outline py-2 px-3"
                  >
                    <FiLogOut /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-2" to="/support">
                    <FiHelpCircle /> Support
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-premium btn-premium-outline py-2 px-3" to="/auth?mode=login">
                    Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-premium btn-premium-cyan py-2 px-3" to="/auth?mode=register">
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
