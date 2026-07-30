import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import GlassCard from '../components/GlassCard';
import { FiPlus, FiTrash2, FiUser, FiPhone, FiMail, FiCheck, FiSliders } from 'react-icons/fi';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  
  // Form states
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSilentEscortEnabled, setIsSilentEscortEnabled] = useState(true);

  const [loading, setLoading] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await API.get('/contacts');
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load contacts", err);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/contacts', {
        name,
        phoneNumber,
        email,
        primary: isPrimary,
        silentEscortEnabled: isSilentEscortEnabled
      });

      if (res.data.success) {
        setName('');
        setPhoneNumber('');
        setEmail('');
        setIsPrimary(false);
        setIsSilentEscortEnabled(true);
        fetchContacts();
        alert("Trusted contact added successfully!");
      }
    } catch (err) {
      alert("Failed to add contact: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      const res = await API.delete(`/contacts/${id}`);
      if (res.data.success) {
        fetchContacts();
      }
    } catch (err) {
      alert("Failed to delete contact: " + err.message);
    }
  };

  return (
    <div className="container py-4 flex-grow-1">
      <div className="row g-4 text-start">
        
        {/* Left Side: Add Contact Form */}
        <div className="col-lg-5">
          <GlassCard>
            <h4 className="text-white fw-bold mb-1">Add Trusted Contact</h4>
            <p className="text-muted small mb-4">Add family members or close friends who will receive SOS locations and Silent Escort alerts.</p>
            
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-muted fw-semibold small">CONTACT NAME</label>
                <div className="position-relative">
                  <FiUser className="position-absolute text-muted" style={{ left: '16px', top: '15px' }} />
                  <input 
                    type="text" 
                    className="form-control premium-input ps-5"
                    placeholder="e.g. Papa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">PHONE NUMBER</label>
                <div className="position-relative">
                  <FiPhone className="position-absolute text-muted" style={{ left: '16px', top: '15px' }} />
                  <input 
                    type="tel" 
                    className="form-control premium-input ps-5"
                    placeholder="e.g. +919876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">EMAIL ADDRESS</label>
                <div className="position-relative">
                  <FiMail className="position-absolute text-muted" style={{ left: '16px', top: '15px' }} />
                  <input 
                    type="email" 
                    className="form-control premium-input ps-5"
                    placeholder="e.g. parent@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="d-flex flex-column gap-2 mt-2">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="primaryToggle"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                  />
                  <label className="form-check-label text-white small fw-bold" htmlFor="primaryToggle">
                    PRIMARY SOS CONTACT (Sends SOS Coordinates)
                  </label>
                </div>

                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="escortToggle"
                    checked={isSilentEscortEnabled}
                    onChange={(e) => setIsSilentEscortEnabled(e.target.checked)}
                  />
                  <label className="form-check-label text-white small fw-bold" htmlFor="escortToggle">
                    SILENT ESCORT ALERTS (Timeout alerts)
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-premium btn-premium-cyan w-100 justify-content-center py-3 mt-3"
                disabled={loading}
              >
                <FiPlus /> {loading ? 'Adding...' : 'ADD TO SECURE CIRCLE'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Side: Secure Circle Grid */}
        <div className="col-lg-7">
          <GlassCard className="h-100">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <FiSliders className="text-cyan" style={{ color: '#00f2fe' }} /> Secure Circle Contacts
            </h5>
            <p className="text-muted small mb-4">Manage notifications routing. Primary contacts receive manual SOS. Silent Escort contacts monitor check-in limits.</p>

            {contacts.length > 0 ? (
              <div className="row g-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="col-md-6">
                    <div className="p-3 rounded-3 h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="text-white fw-bold m-0">{contact.name}</h6>
                        <button 
                          onClick={() => handleDelete(contact.id)}
                          className="btn btn-sm btn-outline-danger border-0 p-1"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="text-muted small mb-3 flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FiPhone size={12} /> {contact.phoneNumber}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <FiMail size={12} /> {contact.email}
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 mt-auto">
                        {contact.isPrimary && (
                          <span className="badge bg-danger text-light small d-flex align-items-center gap-1">
                            <FiCheck /> SOS PRIMARY
                          </span>
                        )}
                        {contact.isSilentEscortEnabled && (
                          <span className="badge bg-primary text-light small d-flex align-items-center gap-1">
                            <FiCheck /> ESCORT GUEST
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                Your secure circle is empty. Please add contacts to receive alerts.
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Contacts;
