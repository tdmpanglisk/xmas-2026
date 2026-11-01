import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

/**
 * Navigation bar with mobile menu
 */
export const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/rsvp', label: 'RSVP' },
    { path: '/admin', label: '', icon: '⚙️' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-xmas-night/95 backdrop-blur-md border-b border-xmas-darkred/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 font-display text-xl text-xmas-gold" aria-label="Christmas 2026 Home">
            <span className="text-2xl">🎄</span>
            <span className="hidden sm:block">XMAS 2026</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-xmas-gold'
                    : 'text-xmas-cream/70 hover:text-xmas-gold'
                }`}
              >
                {link.icon ? <span className="text-xl">{link.icon}</span> : link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-xmas-cream hover:text-xmas-gold transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-xmas-darkred/30 animate-slide-down">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-base font-medium px-2 py-2 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? 'bg-xmas-red/20 text-xmas-gold'
                      : 'text-xmas-cream/70 hover:text-xmas-gold hover:bg-xmas-red/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon ? <span className="text-xl">{link.icon}</span> : link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};