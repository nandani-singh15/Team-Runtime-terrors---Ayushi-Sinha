import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import GlassCard from '../components/GlassCard';
import { FiMap, FiClock, FiCpu, FiTrendingUp, FiCheck, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

const RouteAI = () => {
  const [startLoc, setStartLoc] = useState('University North Campus');
  const [endLoc, setEndLoc] = useState('Connaught Place Metro Station');
  const [startLat] = useState(28.6904);
  const [startLng] = useState(77.2169);
  const [endLat] = useState(28.6304);
  const [endLng] = useState(77.2177);
  
  const [expectedMinutes, setExpectedMinutes] = useState(20);
  const [silentEscort, setSilentEscort] = useState(true);

  const [loading, setLoading] = useState(false);
  const [journey, setJourney] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Poll timeline updates during active journeys
  const fetchTimeline = useCallback(async (journeyId) => {
    try {
      const res = await API.get(`/journeys/${journeyId}/timeline`);
      if (res.data.success) {
        setTimeline(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    // Check if there is an active journey on load
    API.get('/journeys')
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          const active = res.data.data.find(j => 
            j.status === 'ACTIVE' || j.status === 'DEVIATED' || j.status === 'SOS' || j.status === 'TIMEOUT_ALERT'
          );
          if (active) {
            setJourney(active);
            fetchTimeline(active.id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [fetchTimeline]);

  // Handle countdown updates
  useEffect(() => {
    if (!journey || !journey.expectedCheckInTime || journey.status === 'COMPLETED') return;

    const interval = setInterval(() => {
      const expiry = new Date(journey.expectedCheckInTime).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [journey]);

  // Polling timeline updates
  useEffect(() => {
    if (!journey || journey.status === 'COMPLETED') return;

    const timelineInterval = setInterval(() => {
      fetchTimeline(journey.id);
    }, 5000);

    return () => clearInterval(timelineInterval);
  }, [journey, fetchTimeline]);

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/journeys/start', {
        startLocation: startLoc,
        endLocation: endLoc,
        startLat,
        startLng,
        endLat,
        endLng,
        expectedMinutes,
        silentEscortEnabled: silentEscort
      });
      if (res.data.success) {
        setJourney(res.data.data);
        setTimeline([]);
        fetchTimeline(res.data.data.id);
      }
    } catch (err) {
      alert("Failed to start journey: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const res = await API.post('/journeys/complete');
      if (res.data.success) {
        setJourney(null);
        setTimeline([]);
        alert("Arrived safely! Journey protected and completed.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return "TIMEOUT ALERT (Contacts Notified)";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="container py-4 flex-grow-1">
      <div className="row g-4">
        
        {/* Left Side: Route Planner or Status Details */}
        <div className="col-lg-6 text-start">
          {!journey ? (
            <GlassCard>
              <h4 className="text-white fw-bold mb-1">AI Route Safety Planner</h4>
              <p className="text-muted small mb-4">Leverage Gemini intelligence to find the safest travel window and route safety analytics.</p>
              
              <form onSubmit={handleStart} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label text-muted fw-semibold small">START POINT</label>
                  <input 
                    type="text" 
                    className="form-control premium-input"
                    value={startLoc}
                    onChange={(e) => setStartLoc(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label text-muted fw-semibold small">DESTINATION</label>
                  <input 
                    type="text" 
                    className="form-control premium-input"
                    value={endLoc}
                    onChange={(e) => setEndLoc(e.target.value)}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-6">
                    <label className="form-label text-muted fw-semibold small">TRIP DURATION (MINS)</label>
                    <input 
                      type="number" 
                      className="form-control premium-input"
                      value={expectedMinutes}
                      onChange={(e) => setExpectedMinutes(parseInt(e.target.value))}
                      min="5"
                      required
                    />
                  </div>
                  <div className="col-6 d-flex align-items-end">
                    <div className="form-check form-switch mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="silentEscortToggle"
                        checked={silentEscort}
                        onChange={(e) => setSilentEscort(e.target.checked)}
                      />
                      <label className="form-check-label text-white small fw-bold" htmlFor="silentEscortToggle">SILENT ESCORT</label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-premium btn-premium-cyan w-100 justify-content-center py-3 mt-3"
                  disabled={loading}
                >
                  <FiCpu /> {loading ? 'Analyzing Safety...' : 'PLAN & START JOURNEY'}
                </button>
              </form>
            </GlassCard>
          ) : (
            <GlassCard>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-white fw-bold m-0">Live Protection Active</h4>
                <span className={`badge ${journey.status === 'DEVIATED' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                  {journey.status}
                </span>
              </div>
              <p className="text-muted small mb-4">SwaSuraksha AI is auditing checkpoints and monitoring check-ins continuously.</p>

              <div className="mb-4 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-muted small d-block">ACTIVE ROUTE</span>
                <span className="text-white fw-bold d-block mt-1">{journey.startLocation} ➔ {journey.endLocation}</span>
              </div>

              {/* Silent Escort Countdown Timer */}
              {journey.silentEscortEnabled && (
                <div className="mb-4 p-3 rounded-3 border border-opacity-25" style={{ 
                  background: timeLeft <= 60 ? 'rgba(255, 78, 80, 0.08)' : 'rgba(155, 81, 224, 0.08)',
                  borderColor: timeLeft <= 60 ? 'var(--color-red)' : 'var(--color-purple)'
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-white fw-bold small d-flex align-items-center gap-1">
                      <FiClock /> Silent Escort Timer
                    </span>
                    <span className="badge bg-dark text-cyan" style={{ color: '#00f2fe' }}>Interval: {expectedMinutes}m</span>
                  </div>
                  <h3 className={`fw-extrabold m-0 ${timeLeft <= 60 ? 'text-danger' : 'text-warning'}`}>
                    {formatTimeLeft(timeLeft)}
                  </h3>
                  {timeLeft <= 60 && timeLeft > 0 && (
                    <p className="text-danger small m-0 mt-1 d-flex align-items-center gap-1">
                      <FiAlertTriangle /> Missed check-in will trigger primary contact alerts!
                    </p>
                  )}
                </div>
              )}

              {/* AI Safety Assessment Brief */}
              <div className="mb-4 text-start">
                <h6 className="text-white fw-bold d-flex align-items-center gap-2">
                  <FiCpu className="text-cyan" style={{ color: '#00f2fe' }} /> AI Safety Analysis
                </h6>
                <div className="p-3 rounded-3" style={{ background: 'rgba(0, 242, 254, 0.04)', border: '1px solid rgba(0, 242, 254, 0.15)' }}>
                  <div className="d-flex gap-4 mb-2">
                    <div>
                      <span className="text-muted small">Risk Index</span>
                      <h5 className="text-white fw-bold m-0">{journey.riskScore}%</h5>
                    </div>
                    <div>
                      <span className="text-muted small">Safest Window</span>
                      <h5 className="text-cyan fw-bold m-0" style={{ color: '#00f2fe' }}>06:30 AM - 09:30 PM</h5>
                    </div>
                  </div>
                  <p className="text-muted small m-0">{journey.safetyRouteExplanation}</p>
                </div>
              </div>

              <div className="d-flex gap-3">
                <button 
                  onClick={handleComplete} 
                  className="btn btn-premium btn-premium-cyan flex-grow-1 justify-content-center"
                >
                  <FiCheck /> COMPLETE TRIP SAFELY
                </button>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Side: Live Timeline */}
        <div className="col-lg-6 text-start">
          <GlassCard className="h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                <FiTrendingUp className="text-cyan" style={{ color: '#00f2fe' }} /> Journey Safety Timeline
              </h5>
              {journey && (
                <button onClick={() => fetchTimeline(journey.id)} className="btn btn-dark btn-sm text-cyan p-1 px-2 border border-secondary" style={{ color: '#00f2fe' }}>
                  <FiRefreshCw />
                </button>
              )}
            </div>

            {timeline.length > 0 ? (
              <div className="ps-2" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {timeline.map((event) => {
                  let dotClass = "dot-active";
                  if (event.eventType === 'SOS') dotClass = "dot-sos";
                  if (event.eventType === 'ROUTE_DEVIATION' || event.eventType === 'TIMEOUT') dotClass = "dot-deviation";
                  
                  return (
                    <div key={event.id} className="timeline-item">
                      <span className={`timeline-dot ${dotClass}`}></span>
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="text-white fw-semibold m-0">{event.eventType}</h6>
                        <span className="text-muted small">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      <p className="text-muted small mt-1">{event.description}</p>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>Location log Coords: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                No tracking timeline logs available. Plan a journey to display real-time safety updates.
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default RouteAI;
