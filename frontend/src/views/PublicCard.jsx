import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { FiPhone, FiAlertCircle, FiHeart, FiActivity, FiShield } from 'react-icons/fi';

const PublicCard = () => {
  const { key } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Note: We bypass our global API Axios client because this endpoint must NOT include a JWT token in the headers
    // (since a scanning first responder does not have a user account/JWT).
    axios.get(`http://localhost:8084/api/v1/emergency/public-card/${key}`)
      .then((res) => {
        if (res.data.success) {
          setCard(res.data.data);
        } else {
          setError(res.data.message);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Emergency Card not found or access token expired.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key]);

  if (loading) {
    return <div className="container py-5 text-muted">Loading Emergency Profile Details...</div>;
  }

  if (error) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div style={{ maxWidth: '450px', width: '100%' }}>
          <GlassCard className="text-center border-danger border-opacity-50">
            <FiAlertCircle className="text-danger mb-3 animate-pulse" size={48} />
            <h5 className="text-white fw-bold mb-2">Invalid Access Token</h5>
            <p className="text-muted small m-0">{error}</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (card && card.isLocked) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'left' }}>
          <GlassCard className="text-center border-warning border-opacity-50">
            <div className="d-flex justify-content-center mb-3">
              <span className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-25 px-3 py-2 rounded-pill">
                <FiAlertCircle className="me-2" /> ACCESS RESTRICTED
              </span>
            </div>
            
            <h3 className="text-white fw-bold mb-3">{card.fullName}</h3>
            
            <div className="p-4 rounded-4 mb-3 border border-secondary border-opacity-25" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
              <p className="text-muted small m-0" style={{ lineHeight: '1.6' }}>
                For traveler privacy and personal data security, this medical card profile is **locked**. 
                <br/><br/>
                It will automatically decrypt and become readable to first responders only when the user triggers a manual SOS panic alert or misses a scheduled Silent Escort check-in.
              </p>
            </div>

            <p className="text-muted" style={{ fontSize: '0.75rem' }}>
              SwaSuraksha Shield Protection Active
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'left' }}>
        
        {/* Header Indicator */}
        <div className="text-center mb-4">
          <span className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill mb-2">
            <FiActivity className="me-2" /> EMERGENCY MEDICAL IDENTITY
          </span>
          <h3 className="text-white fw-bold m-0 mt-2">{card.fullName}</h3>
          <p className="text-muted small m-0 mt-1">First Responder Portal Scan Successful</p>
        </div>

        {/* Blockchain Integrity Verification */}
        {card.blockchainHash && (
          <div className="p-3 rounded-4 mb-4 border border-success border-opacity-40" style={{ background: 'rgba(25, 135, 84, 0.08)' }}>
            <h6 className="text-success fw-bold d-flex align-items-center gap-2 mb-2" style={{ letterSpacing: '0.5px' }}>
              <FiShield /> BLOCKCHAIN INTEGRITY VERIFIED
            </h6>
            <div className="text-white small">
              <span className="text-muted">Ledger Audit: </span>
              <span className="badge bg-success bg-opacity-25 text-success">UNTAMPERED</span>
              <span className="text-muted d-block mt-2" style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>SHA-256 HASH: {card.blockchainHash}</span>
            </div>
          </div>
        )}

        {/* Paramedic AI Brief Summary (Highlight First) */}
        {card.aiMedicalSummary && (
          <div className="p-3 rounded-4 mb-4 border border-danger border-opacity-40" style={{ background: 'rgba(220, 53, 69, 0.08)' }}>
            <h6 className="text-danger fw-bold d-flex align-items-center gap-2 mb-2" style={{ letterSpacing: '0.5px' }}>
              <FiHeart /> CRITICAL EMERGENCY SUMMARY
            </h6>
            <div className="text-white small" style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
              {card.aiMedicalSummary}
            </div>
          </div>
        )}

        {/* Medical Card Profile details */}
        <div className="d-flex flex-column gap-3 mb-4">
          <GlassCard className="p-3">
            <div className="row g-2">
              <div className="col-6">
                <span className="text-muted small d-block">BLOOD TYPE</span>
                <span className="text-white fw-bold fs-5">{card.bloodType || 'Unknown'}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-3">
            <span className="text-muted small d-block">ALLERGIES</span>
            <span className="text-white fw-semibold d-block mt-1">{card.allergies || 'None Known'}</span>
          </GlassCard>

          <GlassCard className="p-3">
            <span className="text-muted small d-block">CHRONIC CONDITIONS</span>
            <span className="text-white fw-semibold d-block mt-1">{card.medicalConditions || 'None'}</span>
          </GlassCard>

          <GlassCard className="p-3">
            <span className="text-muted small d-block">CURRENT MEDICATIONS</span>
            <span className="text-white fw-semibold d-block mt-1">{card.currentMedications || 'None'}</span>
          </GlassCard>

          <GlassCard className="p-3">
            <span className="text-muted small d-block">FIRST RESPONDER DIRECTIVES</span>
            <span className="text-white fw-semibold d-block mt-1">{card.emergencyInstructions || 'None'}</span>
          </GlassCard>
        </div>

        {/* Emergency Contacts Dial Circle */}
        <GlassCard className="border border-info border-opacity-35" style={{ background: 'rgba(0, 242, 254, 0.04)' }}>
          <h6 className="text-white fw-bold mb-3">Dial Primary Contacts</h6>
          <div className="d-flex flex-column gap-2">
            {card.emergencyContacts && card.emergencyContacts.length > 0 ? (
              card.emergencyContacts.map((contact, idx) => (
                <div key={idx} className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <h6 className="text-white fw-bold m-0">{contact.name}</h6>
                    <span className="text-muted small">{contact.phoneNumber}</span>
                  </div>
                  <a href={`tel:${contact.phoneNumber}`} className="btn btn-premium btn-premium-cyan p-2 px-3">
                    <FiPhone /> Call Now
                  </a>
                </div>
              ))
            ) : (
              <p className="text-muted small text-center m-0 py-2">No emergency contacts set by user.</p>
            )}
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default PublicCard;
