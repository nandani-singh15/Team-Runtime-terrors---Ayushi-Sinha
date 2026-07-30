import React, { useState, useEffect } from 'react';
import API from '../services/api';
import GlassCard from '../components/GlassCard';
import { FiUser, FiActivity, FiDownload, FiCpu, FiAlertCircle, FiShield } from 'react-icons/fi';

const Profile = () => {
  const [bloodType, setBloodType] = useState('Not Specified');
  const [allergies, setAllergies] = useState('None');
  const [medicalConditions, setMedicalConditions] = useState('None');
  const [currentMedications, setCurrentMedications] = useState('None');
  const [emergencyInstructions, setEmergencyInstructions] = useState('None');
  
  const [aiMedicalSummary, setAiMedicalSummary] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [publicAccessKey, setPublicAccessKey] = useState('');
  const [blockchainStatus, setBlockchainStatus] = useState('');
  const [blockchainHash, setBlockchainHash] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get('/emergency/profile');
      if (res.data.success) {
        const p = res.data.data;
        setBloodType(p.bloodType || 'Not Specified');
        setAllergies(p.allergies || 'None');
        setMedicalConditions(p.medicalConditions || 'None');
        setCurrentMedications(p.currentMedications || 'None');
        setEmergencyInstructions(p.emergencyInstructions || 'None');
        setAiMedicalSummary(p.aiMedicalSummary || '');
        setQrCodeBase64(p.qrCodeBase64 || '');
        setPublicAccessKey(p.publicAccessKey || '');
        setBlockchainStatus(p.blockchainStatus || '');
        setBlockchainHash(p.blockchainHash || '');
      }
    } catch (err) {
      console.error("Failed to fetch medical profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await API.put('/emergency/profile', {
        bloodType,
        allergies,
        medicalConditions,
        currentMedications,
        emergencyInstructions
      });

      if (res.data.success) {
        const p = res.data.data;
        setAiMedicalSummary(p.aiMedicalSummary);
        setQrCodeBase64(p.qrCodeBase64);
        setBlockchainStatus(p.blockchainStatus);
        setBlockchainHash(p.blockchainHash);
        alert("Medical profile updated and AI Summary generated!");
      }
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeBase64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${qrCodeBase64}`;
    link.download = `SwaSuraksha_Emergency_QR_${publicAccessKey.substring(0,8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="container py-5 text-muted">Loading safety card...</div>;
  }

  return (
    <div className="container py-4 flex-grow-1">
      <div className="row g-4 text-start">
        
        {/* Left Side: Medical Form */}
        <div className="col-lg-7">
          <GlassCard>
            <h4 className="text-white fw-bold mb-1">Emergency Medical Profile</h4>
            <p className="text-muted small mb-4">First responders scan your locked screen QR code during an incident to review these details.</p>
            
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label text-muted fw-semibold small">BLOOD TYPE</label>
                  <select 
                    className="form-select premium-input"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                  >
                    <option value="Not Specified">Not Specified</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">ALLERGIES (SEPARATED BY COMMA)</label>
                <textarea 
                  rows="2"
                  className="form-control premium-input"
                  placeholder="e.g. Peanuts, Penicillin, Latex"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">CHRONIC MEDICAL CONDITIONS</label>
                <textarea 
                  rows="2"
                  className="form-control premium-input"
                  placeholder="e.g. Diabetes Type-1, Asthma, Hypertension"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">CURRENT MEDICATIONS</label>
                <textarea 
                  rows="2"
                  className="form-control premium-input"
                  placeholder="e.g. Insulin, Albuterol Inhaler"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">EMERGENCY FIRST RESPONDER DIRECTIVES</label>
                <textarea 
                  rows="2"
                  className="form-control premium-input"
                  placeholder="e.g. Inhaler is in front backpack pocket. Contact husband immediately."
                  value={emergencyInstructions}
                  onChange={(e) => setEmergencyInstructions(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-premium btn-premium-cyan w-100 justify-content-center py-3 mt-3"
                disabled={updating}
              >
                <FiActivity /> {updating ? 'Syncing & Generating AI Brief...' : 'SAVE & GENERATE CARD'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Side: QR Render & AI Summary */}
        <div className="col-lg-5">
          <div className="d-flex flex-column gap-4">
            
            {/* QR Card */}
            <GlassCard className="text-center d-flex flex-column align-items-center">
              <h5 className="text-white fw-bold mb-1">Emergency QR Identity</h5>
              <p className="text-muted small mb-4">Download and set this as your lockscreen wallpaper.</p>
              
              {qrCodeBase64 ? (
                <div className="p-3 rounded-4 mb-3" style={{ background: '#ffffff', border: '8px solid #0d1122', boxShadow: '0 0 30px rgba(0, 242, 254, 0.15)' }}>
                  <img 
                    src={`data:image/png;base64,${qrCodeBase64}`} 
                    alt="SwaSuraksha Emergency QR Code"
                    style={{ width: '220px', height: '220px', display: 'block' }}
                  />
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center border border-secondary border-dashed rounded-4 mb-3" style={{ width: '220px', height: '220px', borderStyle: 'dashed' }}>
                  <p className="text-muted small m-0 px-3">QR Code will render upon profile creation.</p>
                </div>
              )}

              {qrCodeBase64 && (
                <button 
                  onClick={handleDownloadQR}
                  className="btn btn-premium btn-premium-outline w-100 justify-content-center mt-2"
                >
                  <FiDownload /> Download QR Code Image
                </button>
              )}
            </GlassCard>

            {/* Blockchain Verification Badge */}
            {blockchainHash && (
              <GlassCard className="border border-success border-opacity-35 text-start" style={{ background: 'rgba(25, 135, 84, 0.03)' }}>
                <h6 className="text-success fw-bold d-flex align-items-center gap-2 mb-2">
                  <FiShield /> Blockchain Security Ledger
                </h6>
                <div className="d-flex flex-column gap-1 small">
                  <span className="text-white">STATUS: <span className="badge bg-success bg-opacity-25 text-success">{blockchainStatus}</span></span>
                  <span className="text-muted" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>SHA-256 HASH: <br/>{blockchainHash}</span>
                </div>
              </GlassCard>
            )}

            {/* AI Medical Summary Panel */}
            <GlassCard>
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FiCpu className="text-purple" style={{ color: '#9b51e0' }} /> Paramedic AI Brief
              </h5>
              
              {aiMedicalSummary ? (
                <div className="p-3 rounded-3 border border-opacity-20" style={{ 
                  background: 'rgba(155, 81, 224, 0.04)',
                  borderColor: 'var(--color-purple)'
                }}>
                  <div className="text-muted small" style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                    {aiMedicalSummary}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted small">
                  <FiAlertCircle className="mb-2" size={20} />
                  <p className="m-0">No summary generated. Click "Save & Generate Card" above to build a paramedic AI summary using Gemini model reasoning.</p>
                </div>
              )}
            </GlassCard>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
