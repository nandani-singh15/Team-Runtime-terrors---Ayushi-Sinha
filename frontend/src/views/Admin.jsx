import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import GlassCard from '../components/GlassCard';
import { FiTrendingUp, FiAlertOctagon, FiCheck, FiX, FiPlus, FiAlertTriangle, FiShield } from 'react-icons/fi';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  
  // SafePoint Seeder Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('POLICE_STATION');
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);
  const [phone, setPhone] = useState('');
  const [seeding, setSeeding] = useState(false);

  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    try {
      // 1. Fetch dashboard analytics stats
      const statsRes = await API.get('/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // 2. Fetch all reports
      const reportsRes = await API.get('/admin/reports');
      if (reportsRes.data.success) {
        setReports(reportsRes.data.data);
      }

      // 3. Fetch feedback tickets
      const feedbackRes = await API.get('/admin/feedback');
      if (feedbackRes.data.success) {
        setFeedback(feedbackRes.data.data);
      }

      // 4. Fetch admin accountability access logs
      const logsRes = await API.get('/admin/access-logs');
      if (logsRes.data.success) {
        setAccessLogs(logsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleModerateReport = async (id, status) => {
    try {
      const res = await API.put(`/admin/reports/${id}`, { status });
      if (res.data.success) {
        loadAdminData();
        alert(`Report status updated to ${status}`);
      }
    } catch (err) {
      alert("Moderate failed: " + err.message);
    }
  };

  const handleResolveFeedback = async (id) => {
    try {
      const res = await API.put(`/admin/feedback/${id}/resolve`);
      if (res.data.success) {
        loadAdminData();
        alert("Feedback ticket resolved successfully.");
      }
    } catch (err) {
      alert("Resolution failed: " + err.message);
    }
  };

  const handleSeedSafePoint = async (e) => {
    e.preventDefault();
    setSeeding(true);

    try {
      const res = await API.post('/admin/safepoints', {
        name,
        description,
        type,
        latitude: lat,
        longitude: lng,
        phoneNumber: phone || '+91 112',
        averageSafetyRating: 5.0,
        totalRatings: 1
      });

      if (res.data.success) {
        setName('');
        setDescription('');
        setPhone('');
        setLat(28.6139);
        setLng(77.2090);
        loadAdminData();
        alert("SafePoint seeded and registered successfully!");
      }
    } catch (err) {
      alert("Seeding failed: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <div className="container py-5 text-muted">Loading Admin dashboard panel...</div>;
  }

  return (
    <div className="container py-4 flex-grow-1 text-start">
      <h2 className="text-white fw-bold mb-1">Admin Moderation Dashboard</h2>
      <p className="text-muted mb-4">Oversee alerts, seed police ranges, verify community incidents, and review support tickets.</p>

      {/* Stats Counters */}
      {stats && (
        <div className="row g-3 mb-5">
          <div className="col-6 col-md-3">
            <GlassCard className="p-3 text-center">
              <h3 className="text-white fw-bold m-0">{stats.activeSOSAlerts}</h3>
              <span className="text-danger small fw-semibold">Active SOS Alerts</span>
            </GlassCard>
          </div>
          <div className="col-6 col-md-3">
            <GlassCard className="p-3 text-center">
              <h3 className="text-white fw-bold m-0">{stats.activeJourneys}</h3>
              <span className="text-cyan small fw-semibold">Active Trips</span>
            </GlassCard>
          </div>
          <div className="col-6 col-md-3">
            <GlassCard className="p-3 text-center">
              <h3 className="text-white fw-bold m-0">{stats.pendingReports}</h3>
              <span className="text-warning small fw-semibold">Pending Community Filings</span>
            </GlassCard>
          </div>
          <div className="col-6 col-md-3">
            <GlassCard className="p-3 text-center">
              <h3 className="text-white fw-bold m-0">{stats.pendingFeedbackTickets}</h3>
              <span className="text-muted small fw-semibold">Open Support Tickets</span>
            </GlassCard>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Community Incident Reports, Accountability logs and Tickets */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            
            {/* Admin Access Audit Logs Card */}
            <GlassCard>
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiShield className="text-cyan" style={{ color: '#00f2fe' }} /> Paramedic Profile Access Audits (Accountability)
              </h5>
              <p className="text-muted small mb-3">Immutable access logs generated every time emergency medical data is queried by an administrator.</p>
              
              {accessLogs.length > 0 ? (
                <div className="table-responsive" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  <table className="table table-dark table-striped table-hover m-0" style={{ fontSize: '0.8rem', background: 'transparent' }}>
                    <thead>
                      <tr>
                        <th>Admin Email</th>
                        <th>User Profile</th>
                        <th>Action Log</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="text-cyan" style={{ color: '#00f2fe' }}>{log.adminUsername}</td>
                          <td className="text-white fw-bold">{log.patientName}</td>
                          <td className="text-muted">{log.reason}</td>
                          <td className="text-white">{new Date(log.accessedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted small text-center my-3">No medical profile audit logs recorded yet.</p>
              )}
            </GlassCard>

            {/* Reports Moderation Card */}
            <GlassCard>
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiAlertOctagon className="text-warning" /> Moderate Incident Filings
              </h5>
              
              {reports.length > 0 ? (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {reports.map((report) => (
                    <div key={report.id} className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <span className={`badge ${report.riskLevel === 'HIGH' ? 'bg-danger' : report.riskLevel === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-info text-dark'} mb-1`} style={{ fontSize: '0.65rem' }}>{report.riskLevel} RISK</span>
                        <h6 className="text-white fw-bold m-0">{report.title}</h6>
                        <span className="text-muted small">{report.description}</span>
                        <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Coords: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                      </div>
                      
                      {report.status === 'PENDING' ? (
                        <div className="d-flex gap-2">
                          <button 
                            onClick={() => handleModerateReport(report.id, 'VERIFIED')}
                            className="btn btn-sm btn-success p-1 px-2 d-flex align-items-center gap-1"
                          >
                            <FiCheck /> Verify
                          </button>
                          <button 
                            onClick={() => handleModerateReport(report.id, 'REJECTED')}
                            className="btn btn-sm btn-danger p-1 px-2 d-flex align-items-center gap-1"
                          >
                            <FiX /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`badge ${report.status === 'VERIFIED' ? 'bg-success bg-opacity-20 text-success' : 'bg-secondary bg-opacity-20 text-muted'}`}>
                          {report.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small text-center my-3">No incident reports filed yet.</p>
              )}
            </GlassCard>

            {/* Support Tickets resolution */}
            <GlassCard>
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiAlertTriangle className="text-danger" /> Feedback & Help Inquiries
              </h5>
              
              {feedback.length > 0 ? (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {feedback.map((ticket) => (
                    <div key={ticket.id} className="p-3 rounded-3 d-flex justify-content-between align-items-start" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <span className="text-cyan fw-bold small" style={{ color: '#00f2fe' }}>[{ticket.status}] {ticket.subject}</span>
                        <h6 className="text-white fw-bold m-0 mt-1">{ticket.fullName} ({ticket.email})</h6>
                        <span className="text-muted small d-block mt-1">{ticket.message}</span>
                      </div>
                      
                      {ticket.status === 'PENDING' && (
                        <button 
                          onClick={() => handleResolveFeedback(ticket.id)}
                          className="btn btn-sm btn-premium btn-premium-cyan p-1 px-2"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small text-center my-3">No open feedback tickets found.</p>
              )}
            </GlassCard>

          </div>
        </div>

        {/* Right Column: SafePoint Seeding Form */}
        <div className="col-lg-4">
          <GlassCard>
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <FiShield className="text-cyan" style={{ color: '#00f2fe' }} /> Seed SafePoint Range
            </h5>
            <p className="text-muted small mb-4">Register new police checkposts, hospitals, and safe shelter spots manually.</p>
            
            <form onSubmit={handleSeedSafePoint} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-muted fw-semibold small">POINT NAME</label>
                <input 
                  type="text" 
                  className="form-control premium-input"
                  placeholder="e.g. Connaught Place Police Post"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">DESCRIPTION</label>
                <input 
                  type="text" 
                  className="form-control premium-input"
                  placeholder="e.g. 24x7 security personnel desk"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">SPOT TYPE</label>
                <select 
                  className="form-select premium-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="POLICE_STATION">POLICE STATION</option>
                  <option value="HOSPITAL">HOSPITAL</option>
                  <option value="SHELTER">SHELTER HOUSE</option>
                  <option value="METRO_STATION">METRO STATION</option>
                  <option value="24X7_STORE">24x7 STORE</option>
                </select>
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">HELPLINE PHONE</label>
                <input 
                  type="tel" 
                  className="form-control premium-input"
                  placeholder="e.g. +91 11-2301-3707"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="row">
                <div className="col-6">
                  <label className="form-label text-muted fw-semibold small">LATITUDE</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    className="form-control premium-input"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-muted fw-semibold small">LONGITUDE</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    className="form-control premium-input"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-premium btn-premium-cyan w-100 justify-content-center py-3 mt-3"
                disabled={seeding}
              >
                <FiPlus /> {seeding ? 'Seeding...' : 'REGISTER SAFEPOINT'}
              </button>
            </form>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Admin;
