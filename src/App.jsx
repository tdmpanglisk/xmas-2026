import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { RSVPForm } from './components/RSVPForm';
import { PotluckMenu } from './components/PotluckMenu';
import { AdminView } from './components/AdminView';
import { initEmailJS } from './utils/emailService';
import { validateInviteCode } from './constants';
import { useEffect, useState, createContext, useContext } from 'react';

// Auth Context for site-wide invite code protection
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = sessionStorage.getItem('xmas2026_auth');
    return stored === 'true';
  });
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated);

  const authenticate = (code) => {
    if (validateInviteCode(code)) {
      sessionStorage.setItem('xmas2026_auth', 'true');
      setIsAuthenticated(true);
      setShowAuthModal(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('xmas2026_auth');
    setIsAuthenticated(false);
    setShowAuthModal(true);
  };

  if (showAuthModal) {
    return (
      <Router>
        <AuthModal onAuthenticate={authenticate} />
      </Router>
    );
  }

  return (
    <Router>
      <AuthContext.Provider value={{ isAuthenticated, logout }}>
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/rsvp" element={<RSVPForm />} />
            <Route path="/menu" element={<PotluckMenu />} />
            <Route path="/admin" element={<AdminView />} />
            <Route path="/logout" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </AuthContext.Provider>
    </Router>
  );
};

const AuthModal = ({ onAuthenticate }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Small delay for better UX
    setTimeout(() => {
      if (onAuthenticate(code.trim())) {
        setCode('');
      } else {
        setError('Invalid invitation code. Please check your invitation and try again.');
      }
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-xmas-night relative overflow-hidden">
      <div className="absolute inset-0 bg-xmas-night/50" />
      <div className="relative z-10 max-w-md w-full">
        <div className="card p-8 sm:p-10 text-center">
          <div className="text-5xl mb-4">🎄</div>
          <h1 className="font-display text-3xl sm:text-4xl text-xmas-gold mb-2">Mah Family Christmas 2026</h1>
          <p className="text-xmas-cream/70 mb-8">Enter your invitation code to access the event details</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <label htmlFor="inviteCode" className="label">Invitation Code</label>
              <input
                id="inviteCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="input-field text-center text-lg tracking-widest font-mono"
                placeholder="MAH-2026-EXCLUSIVE"
                maxLength={20}
                autoComplete="off"
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <p className="text-xmas-red text-sm bg-xmas-red/10 border border-xmas-red/30 rounded-lg p-3" role="alert">
                {error}
              </p>
            )}
            <button 
              type="submit" 
              disabled={isSubmitting || !code.trim()}
              className="btn-primary w-full py-3 text-lg"
            >
              {isSubmitting ? 'Verifying...' : 'Enter Event'}
            </button>
          </form>
          
          <p className="mt-6 text-xs text-xmas-cream/50">
            Didn't receive an invitation? Contact the hosts.
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    try {
      initEmailJS();
    } catch (error) {
      console.error("EmailJS initialization failed:", error);
    }
  }, []);

  return <AuthProvider />;
}

export default App;
