import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiChevronRight, FiMapPin, FiPlay, FiCpu, FiMessageSquare } from 'react-icons/fi';

const Landing = () => {
  return (
    <div className="container py-5 mt-4">
      {/* Hero Section */}
      <div className="row align-items-center mb-5 pb-5">
        <div className="col-lg-6 text-start mb-5 mb-lg-0">
          <span className="badge bg-primary bg-opacity-10 text-cyan border border-info border-opacity-25 px-3 py-2 rounded-pill mb-3" style={{ color: '#00f2fe' }}>
            <FiShield className="me-2" /> Next-Generation Journey Security
          </span>
          <h1 className="display-4 fw-extrabold mb-3" style={{ letterSpacing: '-1.5px', lineHeight: '1.15' }}>
            <span className="gradient-text">Smart Journey Safety</span> <br />
            <span className="gradient-brand">Feel Free to Travel</span>
          </h1>
          <p className="lead text-muted mb-4 fs-5" style={{ maxWidth: '90%' }}>
            Unlike traditional safety apps that only act after an emergency occurs, SwaSuraksha proactively predicts safer routes, monitors silent escort statuses, and generates first-responder QR health cards.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Link className="btn btn-premium btn-premium-cyan px-4 py-3" to="/auth?mode=register">
              Start Free Journey <FiChevronRight />
            </Link>
            <Link className="btn btn-premium btn-premium-outline px-4 py-3" to="/support">
              Explore Safety Map
            </Link>
          </div>
        </div>

        {/* Dynamic Mockup Phone Showcase */}
        <div className="col-lg-6 d-flex justify-content-center">
          <div className="position-relative" style={{ width: '310px', height: '620px' }}>
            {/* Ambient Backlight Glow */}
            <div className="position-absolute" style={{
              top: '10%', left: '10%', right: '10%', bottom: '10%',
              background: 'radial-gradient(circle, rgba(155, 81, 224, 0.45) 0%, transparent 70%)',
              filter: 'blur(30px)', zIndex: '0'
            }}></div>
            
            {/* Phone Body Frame */}
            <div className="w-100 h-100 position-relative border border-secondary border-opacity-50 rounded-5 p-3" style={{
              background: '#0d0e15',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 242, 254, 0.1)',
              borderWidth: '6px !important',
              zIndex: '1'
            }}>
              {/* Notch */}
              <div className="position-absolute start-50 translate-middle-x bg-dark rounded-bottom-4" style={{ top: '0', width: '120px', height: '20px', zIndex: '2' }}></div>
              
              {/* Phone Content Interface */}
              <div className="w-100 h-100 rounded-4 overflow-hidden p-3 text-start position-relative d-flex flex-column" style={{ background: '#07090e', fontSize: '0.85rem' }}>
                <div className="d-flex justify-content-between align-items-center mb-3 mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
                  <span>10:42 AM</span>
                  <span className="text-success d-flex align-items-center gap-1">
                    <span className="d-inline-block bg-success rounded-circle" style={{ width: '6px', height: '6px' }}></span> Live tracking
                  </span>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-white mb-1">Active Journey</h6>
                  <p className="text-muted" style={{ fontSize: '0.75rem' }}>Metro Station ➔ Technical Park</p>
                </div>

                {/* AI Risk Indicator Card */}
                <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold text-white">AI Safety Rating</span>
                    <span className="badge bg-success text-dark fw-bold">92% SAFE</span>
                  </div>
                  <p className="text-muted m-0" style={{ fontSize: '0.7rem' }}>Well-lit, 2 police patrols verified.</p>
                </div>

                {/* Silent Escort Countdown Card */}
                <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(155, 81, 224, 0.08)', border: '1px solid rgba(155, 81, 224, 0.2)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold text-white">Silent Escort</span>
                    <span className="text-danger fw-bold">12m 45s</span>
                  </div>
                  <div className="progress" style={{ height: '4px', background: '#1e293b' }}>
                    <div className="progress-bar bg-primary" role="progressbar" style={{ width: '65%' }}></div>
                  </div>
                </div>

                {/* Journey Timeline Preview */}
                <div className="flex-grow-1 overflow-hidden">
                  <span className="text-muted fw-bold d-block mb-2" style={{ fontSize: '0.7rem' }}>JOURNEY TIMELINE</span>
                  <div className="ps-2">
                    <div className="border-start border-secondary ps-3 pb-2 position-relative" style={{ fontSize: '0.75rem' }}>
                      <span className="position-absolute rounded-circle bg-info" style={{ left: '-4px', top: '4px', width: '7px', height: '7px' }}></span>
                      <span className="text-white d-block fw-semibold">Check-in at Point B</span>
                      <span className="text-muted">Coords verified; speed normal</span>
                    </div>
                    <div className="border-start border-secondary ps-3 pb-2 position-relative" style={{ fontSize: '0.75rem' }}>
                      <span className="position-absolute rounded-circle bg-success" style={{ left: '-4px', top: '4px', width: '7px', height: '7px' }}></span>
                      <span className="text-white d-block fw-semibold">Journey Started</span>
                      <span className="text-muted">Safe path route set</span>
                    </div>
                  </div>
                </div>

                {/* SOS Trigger */}
                <button className="btn btn-danger w-100 py-2 fw-bold text-white rounded-3 mt-auto" style={{
                  background: 'linear-gradient(135deg, #ff4e50, #f9d423)',
                  boxShadow: '0 4px 15px rgba(255, 78, 80, 0.4)',
                  fontSize: '0.8rem'
                }}>
                  ONE-TAP EMERGENCY SOS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid Section */}
      <div className="my-5 py-5 text-center">
        <h2 className="display-6 fw-bold text-white mb-2">Architected for Personal Safety</h2>
        <p className="text-muted mb-5">Proactive journey management and rapid incident response integrations.</p>

        <div className="row g-4">
          <div className="col-md-4">
            <GlassCard className="h-100 text-start">
              <div className="p-3 bg-info bg-opacity-10 text-cyan rounded-3 d-inline-block mb-4" style={{ color: '#00f2fe' }}>
                <FiCpu size={28} />
              </div>
              <h5 className="text-white fw-semibold mb-3">AI Route Safety Explanations</h5>
              <p className="text-muted m-0">Queries Gemini AI model to calculate risk indices based on illumination, community verified flags, and crime statistics.</p>
            </GlassCard>
          </div>
          <div className="col-md-4">
            <GlassCard className="h-100 text-start">
              <div className="p-3 bg-primary bg-opacity-10 text-purple rounded-3 d-inline-block mb-4" style={{ color: '#9b51e0' }}>
                <FiShield size={28} />
              </div>
              <h5 className="text-white fw-semibold mb-3">Silent Escort Guard</h5>
              <p className="text-muted m-0">Specify expected trip duration. If you miss check-in, primary contacts automatically receive SMS/Email with location links.</p>
            </GlassCard>
          </div>
          <div className="col-md-4">
            <GlassCard className="h-100 text-start">
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3 d-inline-block mb-4">
                <FiAlertTriangle size={28} />
              </div>
              <h5 className="text-white fw-semibold mb-3">Responder Medical QR Cards</h5>
              <p className="text-muted m-0">Generate medical QR cards for lockscreens. First responders scan to read allergy directives and contact primary contacts.</p>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Stats Board Section */}
      <div className="my-5 p-5 glass-panel row align-items-center text-center">
        <div className="col-md-4 mb-4 mb-md-0">
          <h3 className="display-5 fw-bold text-white mb-1">2M+</h3>
          <span className="text-muted fw-semibold">Safe Journeys Completed</span>
        </div>
        <div className="col-md-4 mb-4 mb-md-0">
          <h3 className="display-5 fw-bold text-white mb-1">Gemini 1.5</h3>
          <span className="text-muted fw-semibold">AI Risk Engine Powered</span>
        </div>
        <div className="col-md-4">
          <h3 className="display-5 fw-bold text-white mb-1">&lt; 3 Sec</h3>
          <span className="text-muted fw-semibold">SOS Dispatch Response</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
