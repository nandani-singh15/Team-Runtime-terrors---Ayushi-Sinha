import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { FiAlertOctagon, FiCompass, FiShield, FiBell, FiMapPin, FiPhoneCall, FiAlertTriangle } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Coordinates (Delhi center default)
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);
  
  const [activeJourney, setActiveJourney] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeSos, setActiveSos] = useState(null);
  
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [sosNotes, setSosNotes] = useState('');
  const [resolvingSos, setResolvingSos] = useState(false);

  // Load user status, active journey, and notifications
  const loadDashboardData = useCallback(async () => {
    try {
      // 1. Fetch active journey
      const journeysRes = await API.get('/journeys');
      if (journeysRes.data.success && journeysRes.data.data.length > 0) {
        // Find if there is an active journey
        const active = journeysRes.data.data.find(j => 
          j.status === 'ACTIVE' || j.status === 'DEVIATED' || j.status === 'SOS' || j.status === 'TIMEOUT_ALERT'
        );
        setActiveJourney(active || null);
        if (active) {
          setLat(active.currentLat);
          setLng(active.currentLng);
        }
      }

      // 2. Fetch notifications
      const notifRes = await API.get('/notifications/unread');
      if (notifRes.data.success) {
        setNotifications(notifRes.data.data);
      }
    } catch (err) {
      console.error("Dashboard reload failed", err);
    }
  }, []);

  // Fetch nearby hospitals/police stations
  const fetchNearby = useCallback(async (currentLat, currentLng) => {
    setLoadingPlaces(true);
    try {
      const res = await API.get(`/safepoints/nearby?latitude=${currentLat}&longitude=${currentLng}&radius=10.0`);
      if (res.data.success) {
        setNearbyPlaces(res.data.data);
      }
    } catch (err) {
      console.error("Nearby places lookup failed", err);
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    fetchNearby(lat, lng);
  }, [lat, lng, fetchNearby]);

  // SOS button handler
  const handleTriggerSOS = async () => {
    try {
      const res = await API.post('/journeys/sos', { latitude: lat, longitude: lng });
      if (res.data.success) {
        setActiveSos(res.data.data);
        loadDashboardData();
        alert("SOS Alert Triggered successfully! Email notifications dispatched to your trusted contacts.");
      }
    } catch (err) {
      alert("Failed to trigger SOS alert: " + (err.response?.data?.message || err.message));
    }
  };

  // SOS resolve handler
  const handleResolveSOS = async (id) => {
    setResolvingSos(true);
    try {
      const res = await API.post(`/journeys/sos/${id}/resolve`, { notes: sosNotes || 'Resolved safely by user.' });
      if (res.data.success) {
        setActiveSos(null);
        setSosNotes('');
        loadDashboardData();
        alert("Emergency resolved successfully. Journey marked completed.");
      }
    } catch (err) {
      alert("Resolution failed: " + err.message);
    } finally {
      setResolvingSos(false);
    }
  };

  // GPS Simulation movement
  const handleSimulateMovement = async (drift = false) => {
    let nextLat = lat;
    let nextLng = lng;
    
    if (drift) {
      // Offset significantly to trigger ROUTE_DEVIATION
      nextLat += 0.045;
      nextLng += 0.045;
    } else {
      // Normal walk offset
      nextLat += 0.001;
      nextLng += 0.001;
    }
    
    setLat(nextLat);
    setLng(nextLng);

    if (activeJourney) {
      try {
        const res = await API.put('/journeys/location', { latitude: nextLat, longitude: nextLng });
        if (res.data.success) {
          setActiveJourney(res.data.data);
          loadDashboardData();
        }
      } catch (err) {
        console.error("Location update failed", err);
      }
    }
  };

  const handleMarkRead = async (notifId) => {
    try {
      const res = await API.put(`/notifications/${notifId}/read`);
      if (res.data.success) {
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container py-4 flex-grow-1">
      {/* Top greeting banner */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-8 text-start">
          <h2 className="fw-bold text-white mb-1">Welcome, {user?.fullName}</h2>
          <p className="text-muted m-0">SwaSuraksha Shield is active and safeguarding your steps.</p>
        </div>
        <div className="col-md-4 text-end mt-3 mt-md-0">
          <span className="badge bg-dark border border-secondary text-light px-3 py-2 rounded-3">
            <FiCompass className="me-2 text-cyan" style={{ color: '#00f2fe' }} /> Coords: {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Left: SOS & GPS Simulation */}
        <div className="col-lg-6">
          <div className="d-flex flex-column gap-4">
            
            {/* SOS Alert Panel */}
            <GlassCard className="text-center position-relative overflow-hidden">
              <h4 className="text-white fw-bold mb-1">One-Tap Emergency SOS</h4>
              <p className="text-muted mb-4 small">Triggering dispatches coordinates and alerts your trusted circle instantly.</p>
              
              {!activeSos && activeJourney?.status !== 'SOS' ? (
                <div className="d-flex justify-content-center my-4">
                  <div className="sos-outer-ring" onClick={handleTriggerSOS}>
                    <div className="sos-inner-button">SOS</div>
                  </div>
                </div>
              ) : (
                <div className="p-3 border border-danger border-opacity-50 rounded-3 my-3 text-start" style={{ background: 'rgba(255, 78, 80, 0.08)' }}>
                  <h5 className="text-danger fw-bold d-flex align-items-center gap-2">
                    <FiAlertTriangle className="animate-bounce" /> EMERGENCY MODE ACTIVE
                  </h5>
                  <p className="text-muted small">Your primary trusted contacts have been notified via email. Resolve this alert once you are safe.</p>
                  
                  <div className="mt-3">
                    <label className="form-label text-white small fw-bold">RESOLUTION NOTES</label>
                    <input 
                      type="text" 
                      className="form-control premium-input"
                      placeholder="e.g. Back home safely or false trigger"
                      value={sosNotes}
                      onChange={(e) => setSosNotes(e.target.value)}
                    />
                    <button 
                      onClick={() => handleResolveSOS(activeSos?.id || activeJourney?.id)}
                      className="btn btn-danger w-100 mt-2 py-2 fw-bold text-white rounded-3"
                      disabled={resolvingSos}
                    >
                      {resolvingSos ? 'Resolving...' : 'DEACTIVATE SOS & END ALERTS'}
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* GPS Simulation Panel */}
            <GlassCard className="text-start">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiCompass className="text-cyan" style={{ color: '#00f2fe' }} /> Simulator Controls
              </h5>
              <p className="text-muted small mb-4">Mock movement steps to check AI route tracking. Use "Drift Off-Path" to evaluate backend route anomaly flags.</p>
              
              <div className="d-flex gap-3">
                <button 
                  onClick={() => handleSimulateMovement(false)} 
                  className="btn btn-premium btn-premium-outline flex-grow-1"
                >
                  Mock Normal Walk
                </button>
                <button 
                  onClick={() => handleSimulateMovement(true)} 
                  className="btn btn-premium btn-premium-outline border-warning text-warning flex-grow-1"
                >
                  Drift Off-Path
                </button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right Col: Active Journey & Places Lookup */}
        <div className="col-lg-6">
          <div className="d-flex flex-column gap-4">
            
            {/* Active Journey Tracker */}
            <GlassCard className="text-start">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                  <FiShield className="text-purple" style={{ color: '#9b51e0' }} /> Active Journey
                </h5>
                {activeJourney && (
                  <span className={`badge ${activeJourney.status === 'DEVIATED' ? 'bg-warning text-dark' : activeJourney.status === 'SOS' ? 'bg-danger text-light' : 'bg-info text-dark'}`}>
                    {activeJourney.status}
                  </span>
                )}
              </div>

              {activeJourney ? (
                <div>
                  <div className="mb-3">
                    <span className="text-muted small fw-semibold block">FROM - TO</span>
                    <h6 className="text-white fw-bold m-0 mt-1">{activeJourney.startLocation} ➔ {activeJourney.endLocation}</h6>
                  </div>

                  <div className="mb-3">
                    <span className="text-muted small fw-semibold block">AI SAFETY RATING</span>
                    <h6 className="text-cyan fw-bold m-0 mt-1" style={{ color: '#00f2fe' }}>{100 - activeJourney.riskScore}% Security Score</h6>
                    <p className="text-muted small m-0 mt-1">{activeJourney.safetyRouteExplanation}</p>
                  </div>

                  {activeJourney.silentEscortEnabled && (
                    <div className="mb-3">
                      <span className="text-muted small fw-semibold block">SILENT ESCORT CHECK-IN</span>
                      <h6 className="text-warning m-0 mt-1">Countdown timer active (check details in Route AI)</h6>
                    </div>
                  )}

                  <div className="d-flex gap-3 mt-4">
                    <Link className="btn btn-premium btn-premium-cyan flex-grow-1 justify-content-center" to="/route-ai">
                      Track Live Timeline
                    </Link>
                    <button onClick={async () => {
                      try {
                        await API.post('/journeys/complete');
                        loadDashboardData();
                        alert("Journey completed successfully. Stay safe!");
                      } catch (err) {
                        alert(err.message);
                      }
                    }} className="btn btn-premium btn-premium-outline">
                      Arrive Safe
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-4">No active journey found. Start one to enable live AI protection.</p>
                  <Link className="btn btn-premium btn-premium-cyan" to="/route-ai">
                    Plan Safe Journey
                  </Link>
                </div>
              )}
            </GlassCard>

            {/* Smart Emergency Assistance: Nearby Safe Points */}
            <GlassCard className="text-start">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiMapPin className="text-cyan" style={{ color: '#00f2fe' }} /> Nearby Safety Points
              </h5>
              <p className="text-muted small mb-3">Verified support spots within range of your current location coordinates.</p>

              {loadingPlaces ? (
                <p className="text-muted text-center my-3">Loading places...</p>
              ) : nearbyPlaces.length > 0 ? (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  {nearbyPlaces.map((place) => (
                    <div key={place.id} className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <span className="badge bg-secondary bg-opacity-20 text-cyan mb-1" style={{ color: '#00f2fe', fontSize: '0.65rem' }}>{place.type}</span>
                        <h6 className="text-white fw-bold m-0" style={{ fontSize: '0.85rem' }}>{place.name}</h6>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{place.description}</span>
                      </div>
                      <a href={`https://maps.google.com/?q=${place.latitude},${place.longitude}`} target="_blank" rel="noreferrer" className="btn btn-premium btn-premium-outline p-2">
                        <FiPhoneCall size={14} /> Navigate
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small text-center my-3">No verified safe points within 10km. Start mapping safe locations!</p>
              )}
            </GlassCard>

            {/* Alerts Feed */}
            {notifications.length > 0 && (
              <GlassCard className="text-start">
                <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                  <FiBell className="text-danger animate-pulse" /> Active Alerts
                </h5>
                <div className="d-flex flex-column gap-2">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(255, 78, 80, 0.05)', border: '1px solid rgba(255, 78, 80, 0.15)' }}>
                      <div>
                        <h6 className="text-white fw-bold m-0" style={{ fontSize: '0.8rem' }}>{notif.title}</h6>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{notif.content}</span>
                      </div>
                      <button onClick={() => handleMarkRead(notif.id)} className="btn btn-premium btn-premium-outline p-1 px-2" style={{ fontSize: '0.7rem' }}>
                        Dismiss
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
