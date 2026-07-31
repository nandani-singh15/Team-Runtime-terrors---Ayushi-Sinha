import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { FiAlertOctagon, FiCompass, FiShield, FiBell, FiMapPin, FiPhoneCall, FiAlertTriangle, FiPlus, FiPhone } from 'react-icons/fi';

const Dashboard = () => {
  const { user, t } = useAuth();
  
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

  // SOS Hold and Cancel states
  const [isHolding, setIsHolding] = useState(false);
  const [holdPercent, setHoldPercent] = useState(0);
  const [showCancelWindow, setShowCancelWindow] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(5);
  
  const [holdIntervalId, setHoldIntervalId] = useState(null);
  const [cancelIntervalId, setCancelIntervalId] = useState(null);

  // Quick Setup wizard states
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [qsBloodType, setQsBloodType] = useState('O+');
  const [qsContactName, setQsContactName] = useState('');
  const [qsContactPhone, setQsContactPhone] = useState('');
  const [qsContactEmail, setQsContactEmail] = useState('');
  const [qsSubmitting, setQsSubmitting] = useState(false);

  // Coordinate dispatch mock states
  const [dispatchStatus, setDispatchStatus] = useState('');
  const [dispatching, setDispatching] = useState(false);

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

      // 3. Check if user needs quick setup
      const profileRes = await API.get('/emergency/profile');
      if (profileRes.data.success && profileRes.data.data.bloodType === 'Not Specified') {
        setShowQuickSetup(true);
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
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
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

  // SOS Hold timer logic
  const startHold = () => {
    if (showCancelWindow || activeSos || activeJourney?.status === 'SOS') return;
    setIsHolding(true);
    setHoldPercent(0);
    if (navigator.vibrate) navigator.vibrate(50);

    let pct = 0;
    const interval = setInterval(() => {
      pct += 4.0; 
      if (pct >= 100) {
        clearInterval(interval);
        setIsHolding(false);
        setHoldPercent(0);
        if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
        enterCancelWindow();
      } else {
        setHoldPercent(Math.floor(pct));
      }
    }, 100);
    setHoldIntervalId(interval);
  };

  const endHold = () => {
    setIsHolding(false);
    setHoldPercent(0);
    if (holdIntervalId) {
      clearInterval(holdIntervalId);
      setHoldIntervalId(null);
    }
  };

  const enterCancelWindow = () => {
    setShowCancelWindow(true);
    setCancelCountdown(5);

    const interval = setInterval(() => {
      setCancelCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowCancelWindow(false);
          handleTriggerSOS();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    setCancelIntervalId(interval);
  };

  const handleAbortSOS = () => {
    if (cancelIntervalId) {
      clearInterval(cancelIntervalId);
      setCancelIntervalId(null);
    }
    setShowCancelWindow(false);
    setCancelCountdown(5);
    alert("SOS Dispatch Aborted.");
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
      nextLat += 0.045;
      nextLng += 0.045;
    } else {
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

  const handleQuickSetupSubmit = async (e) => {
    e.preventDefault();
    setQsSubmitting(true);
    try {
      await API.put('/emergency/profile', {
        bloodType: qsBloodType,
        allergies: "None",
        medicalConditions: "None",
        currentMedications: "None",
        emergencyInstructions: "None"
      });

      await API.post('/contacts', {
        name: qsContactName,
        phoneNumber: qsContactPhone,
        email: qsContactEmail || 'emergency@swasuraksha.com',
        primary: true,
        silentEscortEnabled: true
      });

      setShowQuickSetup(false);
      loadDashboardData();
      alert("Emergency Quick Setup Completed!");
    } catch (err) {
      alert("Quick Setup failed: " + err.message);
    } finally {
      setQsSubmitting(false);
    }
  };

  // Dialers helpers find closest police post and hospital in range
  const nearestPolice = nearbyPlaces.find(p => p.type === 'POLICE_STATION' || p.type === 'POLICE');
  const nearestHospital = nearbyPlaces.find(p => p.type === 'HOSPITAL');

  const handleAlertNearestPolice = () => {
    if (!nearestPolice) {
      alert("No dispatcher safe point found in range. Broad-casting emergency coordinates via standard channels.");
      setDispatchStatus(`Emergency broadcast active. Coords: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      return;
    }
    setDispatching(true);
    setDispatchStatus("Locating dispatch console...");
    setTimeout(() => {
      setDispatching(false);
      setDispatchStatus(`Coordinates successfully dispatched to ${nearestPolice.name}. Alert triggered on dispatcher desk. Coords: (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    }, 1500);
  };

  return (
    <div className="container py-4 flex-grow-1">
      
      {/* Emergency Quick Setup banner */}
      {showQuickSetup && (
        <div className="mb-4 text-start">
          <GlassCard className="border border-info border-opacity-40" style={{ background: 'rgba(0, 242, 254, 0.03)' }}>
            <h5 className="text-white fw-bold d-flex align-items-center gap-2 mb-1">
              <FiPlus className="text-cyan animate-pulse" style={{ color: '#00f2fe' }} /> {t('quickSetup')}
            </h5>
            <p className="text-muted small mb-4">{t('quickSetupSub')}</p>
            
            <form onSubmit={handleQuickSetupSubmit} className="row g-3">
              <div className="col-md-3">
                <label className="form-label text-muted fw-semibold small">{t('bloodGroup')}</label>
                <select 
                  className="form-select premium-input"
                  value={qsBloodType}
                  onChange={(e) => setQsBloodType(e.target.value)}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label text-muted fw-semibold small">CONTACT NAME</label>
                <input 
                  type="text" 
                  className="form-control premium-input"
                  placeholder="e.g. Mom"
                  value={qsContactName}
                  onChange={(e) => setQsContactName(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label text-muted fw-semibold small">{t('emergencyContact')}</label>
                <input 
                  type="tel" 
                  className="form-control premium-input"
                  placeholder="e.g. +91 9999999999"
                  value={qsContactPhone}
                  onChange={(e) => setQsContactPhone(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <button 
                  type="submit" 
                  className="btn btn-premium btn-premium-cyan w-100 justify-content-center py-2"
                  disabled={qsSubmitting}
                >
                  {qsSubmitting ? 'Saving...' : t('completeSetup')}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Top greeting banner */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-8 text-start">
          <h2 className="fw-bold text-white mb-1">{t('welcome')}, {user?.fullName}</h2>
          <p className="text-muted m-0">SwaSuraksha Shield is active and safeguarding your steps.</p>
        </div>
        <div className="col-md-4 text-end mt-3 mt-md-0">
          <span className="badge bg-dark border border-secondary text-light px-3 py-2 rounded-3">
            <FiCompass className="me-2 text-cyan" style={{ color: '#00f2fe' }} /> Coords: {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Left: SOS, Quick Helpline & GPS Simulation */}
        <div className="col-lg-6">
          <div className="d-flex flex-column gap-4">
            
            {/* SOS Alert Panel */}
            <GlassCard className="text-center position-relative overflow-hidden">
              <h4 className="text-white fw-bold mb-1">{t('sosTitle')}</h4>
              <p className="text-muted mb-4 small">{t('sosSub')}</p>
              
              {!activeSos && activeJourney?.status !== 'SOS' ? (
                <div className="d-flex flex-column align-items-center my-4">
                  {showCancelWindow ? (
                    <div className="p-3 border border-warning border-opacity-50 rounded-4 text-center w-100" style={{ background: 'rgba(255, 193, 7, 0.08)' }}>
                      <h5 className="text-warning fw-bold mb-1">
                        DISPATCHING SOS IN {cancelCountdown}s...
                      </h5>
                      <p className="text-muted small mb-3">Tapping Abort will stop emergency alerts.</p>
                      <button onClick={handleAbortSOS} className="btn btn-warning w-100 fw-bold">
                        ABORT SOS DISPATCH
                      </button>
                    </div>
                  ) : (
                    <>
                      <div 
                        className="sos-outer-ring" 
                        onMouseDown={startHold}
                        onMouseUp={endHold}
                        onMouseLeave={endHold}
                        onTouchStart={startHold}
                        onTouchEnd={endHold}
                        style={{
                          transform: isHolding ? 'scale(0.95)' : 'scale(1)',
                          transition: 'transform 0.15s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <div className="sos-inner-button d-flex flex-column justify-content-center align-items-center">
                          <span className="fw-extrabold" style={{ fontSize: '1.4rem' }}>SOS</span>
                          {isHolding && <span className="small text-warning" style={{ fontSize: '0.65rem' }}>{holdPercent}%</span>}
                        </div>
                      </div>
                      <span className="text-muted small mt-3 fw-semibold">
                        {isHolding ? "RELEASE TO CANCEL" : t('holdToTrigger')}
                      </span>
                    </>
                  )}
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
                      {resolvingSos ? 'Resolving...' : t('cancelSOS')}
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* One-Tap Local Help Desk */}
            <GlassCard className="text-start">
              <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                <FiPhoneCall className="text-cyan" style={{ color: '#00f2fe' }} /> One-Tap Local Help Desk
              </h5>
              <p className="text-muted small mb-3">Dial or alert nearest public authorities based on your coordinates.</p>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <a 
                  href={nearestPolice ? `tel:${nearestPolice.phoneNumber || '112'}` : 'tel:112'}
                  className="btn btn-premium btn-premium-outline border-danger text-danger flex-grow-1 justify-content-center py-2 px-3"
                  style={{ fontSize: '0.82rem' }}
                >
                  🚨 Police {nearestPolice ? `(${nearestPolice.name.split(' ')[0]})` : ''}
                </a>

                <a 
                  href={nearestHospital ? `tel:${nearestHospital.phoneNumber || '102'}` : 'tel:102'}
                  className="btn btn-premium btn-premium-outline border-info text-info flex-grow-1 justify-content-center py-2 px-3"
                  style={{ fontSize: '0.82rem' }}
                >
                  🏥 Hospital {nearestHospital ? `(${nearestHospital.name.split(' ')[0]})` : ''}
                </a>
              </div>

              <button 
                onClick={handleAlertNearestPolice}
                className="btn btn-premium btn-premium-cyan w-100 justify-content-center py-2"
                style={{ fontSize: '0.85rem' }}
                disabled={dispatching}
              >
                📡 {dispatching ? 'Establishing link...' : 'DISPATCH COORDS TO NEAREST STATION'}
              </button>

              {dispatchStatus && (
                <div className="p-3 mt-3 rounded-3 border border-info border-opacity-40" style={{ background: 'rgba(0, 242, 254, 0.05)' }}>
                  <span className="text-info fw-bold small d-block">📡 DISPATCH COORDS LOGS</span>
                  <p className="text-white small m-0 mt-1" style={{ fontSize: '0.8rem' }}>{dispatchStatus}</p>
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
                  <FiShield className="text-purple" style={{ color: '#9b51e0' }} /> {t('activeJourney')}
                </h5>
                {activeJourney && (
                  <span className={`badge ${activeJourney.status === 'DEVIATED' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
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
                    <span className="text-muted small fw-semibold block">{t('safetyScore')}</span>
                    <h6 className="text-cyan fw-bold m-0 mt-1" style={{ color: '#00f2fe' }}>{100 - activeJourney.riskScore}% Security Score</h6>
                    <span className="text-warning d-block my-1" style={{ fontSize: '0.68rem', opacity: '0.85' }}>
                      ⚠️ {t('confidenceDisclaimer')}
                    </span>
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
                <FiMapPin className="text-cyan" style={{ color: '#00f2fe' }} /> {t('nearbyPoints')}
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
                        {place.phoneNumber && <span className="text-info d-block" style={{ fontSize: '0.7rem' }}>☎ {place.phoneNumber}</span>}
                      </div>
                      <div className="d-flex gap-2">
                        {place.phoneNumber && (
                          <a href={`tel:${place.phoneNumber}`} className="btn btn-outline-info p-2 px-3">
                            <FiPhone size={14} />
                          </a>
                        )}
                        <a href={`https://maps.google.com/?q=${place.latitude},${place.longitude}`} target="_blank" rel="noreferrer" className="btn btn-premium btn-premium-outline p-2">
                          <FiMapPin size={14} /> Maps
                        </a>
                      </div>
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
