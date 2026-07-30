import React, { useState } from 'react';
import API from '../services/api';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { FiMessageSquare, FiAlertCircle, FiStar, FiActivity } from 'react-icons/fi';

const Support = () => {
  const { user } = useAuth();

  // Support Form State
  const [fullName, setFullName] = useState(user ? user.fullName : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Safety Rating Form State
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/safepoints/feedback', {
        fullName,
        email,
        subject,
        message
      });

      if (res.data.success) {
        setSubject('');
        setMessage('');
        alert("Your support request has been submitted. Our response team will reach out to you shortly!");
      }
    } catch (err) {
      alert("Failed to submit request: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setRatingLoading(true);

    try {
      const res = await API.post('/safepoints/ratings', {
        latitude: lat,
        longitude: lng,
        rating,
        comment
      });

      if (res.data.success) {
        setComment('');
        alert("Thank you for your rating! Your review helps build safer navigation paths for everyone.");
      }
    } catch (err) {
      alert("Failed to submit rating: " + err.message);
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="container py-4 flex-grow-1">
      <div className="row g-4 text-start">
        
        {/* Left Side: Support Form */}
        <div className="col-lg-6">
          <GlassCard>
            <h4 className="text-white fw-bold mb-1">Help & Support</h4>
            <p className="text-muted small mb-4">Have questions or found an issue? Submit a ticket below to contact our safety dispatches.</p>
            
            <form onSubmit={handleSupportSubmit} className="d-flex flex-column gap-3">
              {!user && (
                <>
                  <div>
                    <label className="form-label text-muted fw-semibold small">FULL NAME</label>
                    <input 
                      type="text" 
                      className="form-control premium-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label text-muted fw-semibold small">EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      className="form-control premium-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="form-label text-muted fw-semibold small">SUBJECT</label>
                <input 
                  type="text" 
                  className="form-control premium-input"
                  placeholder="e.g. Map loading issue or suggestions"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">DETAILED MESSAGE</label>
                <textarea 
                  rows="4"
                  className="form-control premium-input"
                  placeholder="Describe your inquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-premium btn-premium-cyan w-100 justify-content-center py-3 mt-2"
                disabled={loading}
              >
                <FiMessageSquare /> {loading ? 'Submitting...' : 'SUBMIT SUPPORT TICKET'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Side: Route Safety Rating System */}
        <div className="col-lg-6">
          <GlassCard className="h-100">
            <h4 className="text-white fw-bold mb-1">Safety Rating System</h4>
            <p className="text-muted small mb-4">Help the SwaSuraksha community by rating the safety level of specific coordinates.</p>
            
            <form onSubmit={handleRatingSubmit} className="d-flex flex-column gap-3">
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

              <div>
                <label className="form-label text-muted fw-semibold small">SAFETY RATING</label>
                <div className="d-flex align-items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar 
                      key={star} 
                      size={28}
                      className="cursor-pointer"
                      style={{ 
                        color: star <= rating ? 'var(--color-amber)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fill: star <= rating ? 'var(--color-amber)' : 'none'
                      }}
                      onClick={() => setRating(star)}
                    />
                  ))}
                  <span className="text-white fw-bold ms-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="form-label text-muted fw-semibold small">COMMENTS (LIGHTING, PATROLS, CROWD)</label>
                <textarea 
                  rows="3"
                  className="form-control premium-input"
                  placeholder="e.g. Well lit streets, active neighborhood policing, safe to walk."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-premium btn-premium-purple w-100 justify-content-center py-3 mt-2"
                disabled={ratingLoading || !user}
              >
                <FiActivity /> {ratingLoading ? 'Submitting...' : !user ? 'SIGN IN TO SUBMIT RATING' : 'SUBMIT SAFETY REVIEW'}
              </button>
            </form>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Support;
