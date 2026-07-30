import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

const translations = {
  en: {
    dashboard: "Dashboard",
    routeAI: "Route AI",
    qrCard: "QR Card",
    contacts: "Contacts",
    support: "Support",
    adminPanel: "Admin Panel",
    logout: "Logout",
    welcome: "Welcome",
    sosTitle: "One-Tap Emergency SOS",
    sosSub: "Triggering dispatches coordinates and alerts your trusted circle instantly.",
    holdToTrigger: "HOLD FOR 3S TO TRIGGER SOS",
    cancelSOS: "CANCEL SOS",
    activeJourney: "Active Journey",
    nearbyPoints: "Nearby Safety Points",
    safetyScore: "Safety Score",
    safestWindow: "Safest Window",
    confidenceDisclaimer: "Safety rating is calculated based on ambient illumination, crime reports, and community verification. Exercise caution.",
    quickSetup: "Emergency Quick Setup",
    quickSetupSub: "Unlock emergency dispatches instantly by entering basic profile indicators.",
    fullName: "Full Name",
    bloodGroup: "Blood Group",
    emergencyContact: "Emergency Phone",
    completeSetup: "Activate Emergency Guard",
    lockedCard: "ACCESS RESTRICTED: Emergency medical profile is locked. No active SOS alert found for this user."
  },
  hi: {
    dashboard: "डैशबोर्ड",
    routeAI: "रूट एआई",
    qrCard: "क्यूआर कार्ड",
    contacts: "संपर्क",
    support: "सहायता",
    adminPanel: "एडमिन पैनल",
    logout: "लॉगआउट",
    welcome: "स्वागत है",
    sosTitle: "वन-टैप आपातकालीन एसओएस",
    sosSub: "एसओएस दबाने से तुरंत आपके सुरक्षा संपर्कों को स्थान और चेतावनी संदेश चले जाते हैं।",
    holdToTrigger: "एसओएस सक्रिय करने के लिए 3 सेकंड दबाए रखें",
    cancelSOS: "एसओएस रद्द करें",
    activeJourney: "सक्रिय यात्रा",
    nearbyPoints: "आस-पास के सुरक्षा केंद्र",
    safetyScore: "सुरक्षा स्कोर",
    safestWindow: "सबसे सुरक्षित समय",
    confidenceDisclaimer: "सुरक्षा रेटिंग प्रकाश व्यवस्था, अपराध रिकॉर्ड और सामुदायिक सूचनाओं पर आधारित है। कृपया सावधानी बरतें।",
    quickSetup: "आपातकालीन त्वरित सेटअप",
    quickSetupSub: "मूल विवरण दर्ज करके आपातकालीन सुरक्षा तुरंत सक्रिय करें।",
    fullName: "पूरा नाम",
    bloodGroup: "रक्त समूह",
    emergencyContact: "आपातकालीन फोन",
    completeSetup: "आपातकालीन सुरक्षा सक्रिय करें",
    lockedCard: "पहुंच प्रतिबंधित: आपातकालीन मेडिकल प्रोफाइल लॉक है। इस उपयोगकर्ता के लिए कोई सक्रिय एसओएस चेतावनी नहीं मिली।"
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.get('/auth/me')
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, email: uEmail, fullName, role } = res.data.data;
        localStorage.setItem('token', token);
        setUser({ email: uEmail, fullName, role });
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please check credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName, phoneNumber) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { email, password, fullName, phoneNumber });
      if (res.data.success) {
        const { token, email: uEmail, fullName: uName, role } = res.data.data;
        localStorage.setItem('token', token);
        setUser({ email: uEmail, fullName: uName, role });
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    language,
    toggleLanguage,
    t
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
