import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { EVENT_CONFIG } from '../constants';
import { ChristmasBackground } from './ChristmasBackground';
import pigRoastImage from '../assets/pigroastimage.jpg';

const EventDetailItem = ({ icon, label, value }) => (
  <div className="flex flex-col items-center p-4 bg-xmas-night/40 backdrop-blur-sm border border-xmas-darkred/20 rounded-xl hover:border-xmas-red/30 transition-colors">
    <div className="text-xmas-red mb-2">{icon}</div>
    <div className="text-xs text-xmas-cream/50 uppercase tracking-wider">{label}</div>
    <div className="text-sm font-medium text-xmas-cream text-center">{value}</div>
  </div>
);

const TimeUnit = ({ value, label }) => (
  <div className="text-center">
    <div className="font-display text-3xl md:text-4xl font-bold text-xmas-red tabular-nums">{value}</div>
    <div className="text-xs text-xmas-cream/60 uppercase tracking-wider">{label}</div>
  </div>
);

// Modern abstract line decorations
const AbstractLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4A843" stopOpacity="0.6"/>
        <stop offset="50%" stopColor="#C41E3A" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="#D4A843" stopOpacity="0.6"/>
      </linearGradient>
      <linearGradient id="redGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C41E3A" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#D4A843" stopOpacity="0.3"/>
      </linearGradient>
    </defs>
    <path d="M50,400 Q300,200 600,400 Q900,600 1150,400" stroke="url(#goldGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="10,5">
      <animate attributeName="stroke-dashoffset" from="0" to="100" dur="20s" repeatCount="indefinite"/>
    </path>
    <path d="M50,500 Q300,350 600,500 Q900,650 1150,500" stroke="url(#redGradient)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="8,8">
      <animate attributeName="stroke-dashoffset" from="100" to="0" dur="15s" repeatCount="indefinite"/>
    </path>
    <path d="M50,300 Q300,450 600,300 Q900,150 1150,300" stroke="#D4A843" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4" strokeDasharray="5,10">
      <animate attributeName="stroke-dashoffset" from="0" to="50" dur="25s" repeatCount="indefinite"/>
    </path>
    <circle cx="200" cy="200" r="60" fill="none" stroke="#D4A843" strokeWidth="1" opacity="0.3">
      <animate attributeName="r" values="60;80;60" dur="8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="1000" cy="600" r="80" fill="none" stroke="#C41E3A" strokeWidth="1" opacity="0.2">
      <animate attributeName="r" values="80;100;80" dur="10s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.2;0.05;0.2" dur="10s" repeatCount="indefinite"/>
    </circle>
    <polygon points="900,150 950,80 1000,150" fill="none" stroke="#D4A843" strokeWidth="1.5" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.1;0.4" dur="6s" repeatCount="indefinite"/>
    </polygon>
    <rect x="150" y="650" width="4" height="120" fill="url(#goldGradient)" opacity="0.5">
      <animate attributeName="height" values="120;60;120" dur="4s" repeatCount="indefinite"/>
    </rect>
    <rect x="1050" y="100" width="4" height="80" fill="url(#redGradient)" opacity="0.5">
      <animate attributeName="height" values="80;40;80" dur="5s" repeatCount="indefinite"/>
    </rect>
    <g stroke="#D4A843" strokeWidth="0.5" opacity="0.15">
      <line x1="0" y1="200" x2="1200" y2="200" strokeDasharray="20,40">
        <animate attributeName="stroke-dashoffset" from="0" to="60" dur="30s" repeatCount="indefinite"/>
      </line>
      <line x1="0" y1="400" x2="1200" y2="400" strokeDasharray="20,40">
        <animate attributeName="stroke-dashoffset" from="60" to="0" dur="30s" repeatCount="indefinite"/>
      </line>
      <line x1="0" y1="600" x2="1200" y2="600" strokeDasharray="20,40">
        <animate attributeName="stroke-dashoffset" from="30" to="90" dur="30s" repeatCount="indefinite"/>
      </line>
    </g>
  </svg>
);

export const Hero = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date("December 25, 2026 17:00:00").getTime();
      const now = new Date().getTime();
      const difference = eventDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative min-h-screen pt-16 overflow-hidden">
      <ChristmasBackground showSnow={false} showOrnaments={true} />
      <AbstractLines />
      
      {/* Pig Roast Hero Image at TOP with 馬家 聖誕快樂 integrated */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative aspect-[16/9] sm:aspect-[2/1] rounded-3xl overflow-hidden bg-gradient-to-br from-xmas-darkred/30 via-xmas-night to-xmas-darkgreen/30 border-2 border-xmas-gold/40 shadow-2xl shadow-xmas-gold/20">
          <img 
            src={pigRoastImage} 
            alt="Traditional Hawaiian Kālua Pig Roast with Lei" 
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-xmas-night/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-end justify-center p-3 pb-5 sm:p-4 sm:pb-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-1">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-xmas-gold to-transparent" />
                <span className="text-base sm:text-lg animate-pulse-slow">🐷</span>
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-xmas-gold to-transparent" />
              </div>
              <h1 className="font-display text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-xmas-cream mb-1.5 leading-tight text-balance drop-shadow-lg">
                <span className="text-xmas-gold">馬家 聖誕快樂</span>
                <br />
                Mah Family Hawaiian Christmas 2026
                
                
              </h1>
              <div className="inline-flex items-center space-x-2 bg-xmas-gold/20 border border-xmas-gold/40 px-2.5 py-0.5 rounded-full text-xmas-gold font-semibold text-[10px] sm:text-xs">
                <span>✨</span>
                <span>Hosted by Annie, Tran and Lulu's</span>
                <span>✨</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 border-4 border-xmas-gold/20 rounded-3xl pointer-events-none" />
          <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-xmas-gold/60 rounded-tl-xl" />
          <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-xmas-gold/60 rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-xmas-gold/60 rounded-bl-xl" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-xmas-gold/60 rounded-br-xl" />
        </div>
      </div>

      {/* Content below image */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          {/* Subtitle - compact */}
          <p className="text-sm sm:text-base text-xmas-cream/70 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Join us for a tropical holiday celebration with Roast Pig and aloha spirit. 
            Bring your leis, wear your best aloha shirts, and let&apos;s make memories under the palms!
          </p>

          {/* Countdown timer */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-br from-xmas-red/20 via-xmas-darkred/10 to-xmas-night rounded-3xl p-8 border-2 border-xmas-red/30 shadow-2xl shadow-xmas-red/20">
              <div className="flex items-center justify-center space-x-8 mb-8 flex-wrap">
                <div className="bg-xmas-night/50 backdrop-blur-sm border-2 border-xmas-red/50 rounded-2xl p-6 animate-float">
                  <div className="text-3xl mb-1">📅</div>
                  <div className="text-xs text-xmas-cream/50 uppercase tracking-wider">Date</div>
                  <div className="font-display text-xl font-bold text-xmas-cream">{EVENT_CONFIG.date}</div>
                </div>
                <div className="bg-xmas-night/50 backdrop-blur-sm border-2 border-xmas-gold/50 rounded-2xl p-6 animate-float" style={{ animationDelay: '0.2s' }}>
                  <div className="text-3xl mb-1">🕕</div>
                  <div className="text-xs text-xmas-cream/50 uppercase tracking-wider">Time</div>
                  <div className="font-display text-xl font-bold text-xmas-gold">{EVENT_CONFIG.time}</div>
                </div>
                <div className="bg-xmas-night/50 backdrop-blur-sm border-2 border-xmas-green/50 rounded-2xl p-6 animate-float" style={{ animationDelay: '0.4s' }}>
                  <div className="text-3xl mb-1">📍</div>
                  <div className="text-xs text-xmas-cream/50 uppercase tracking-wider">Location</div>
                  <div className="font-display text-lg font-bold text-xmas-cream text-center">1183 Hainstock Green SW<br />Edmonton, AB</div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-6 p-4 bg-xmas-night/30 backdrop-blur-sm border border-xmas-gold/20 rounded-xl max-w-md mx-auto">
                <TimeUnit value={timeLeft.days} label="Days" />
                <span className="text-xmas-gold text-2xl">:</span>
                <TimeUnit value={String(timeLeft.hours).padStart(2, "0")} label="Hours" />
                <span className="text-xmas-gold text-2xl">:</span>
                <TimeUnit value={String(timeLeft.minutes).padStart(2, "0")} label="Minutes" />
                <span className="text-xmas-gold text-2xl">:</span>
                <TimeUnit value={String(timeLeft.seconds).padStart(2, "0")} label="Seconds" />
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/rsvp" className="btn-primary group inline-flex items-center space-x-2 text-base px-8 py-3">
              <span>RSVP Now</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link to="/menu" className="btn-secondary inline-flex items-center space-x-2 text-base px-8 py-3">
              <span>View Luau Menu</span>
            </Link>
          </div>
          
          {/* Event details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            <EventDetailItem icon={<Calendar className="w-5 h-5" />} label="Date" value={EVENT_CONFIG.date} />
            <EventDetailItem icon={<Clock className="w-5 h-5" />} label="Time" value={EVENT_CONFIG.time} />
            <EventDetailItem icon={<MapPin className="w-5 h-5" />} label="Location" value="1183 Hainstock Green SW, Edmonton, AB" />
            <EventDetailItem icon={<Users className="w-5 h-5" />} label="Guests" value={"Up to " + EVENT_CONFIG.maxGuests} />
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-xmas-cream/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-xmas-gold rounded-full animate-scroll-down" />
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 opacity-20 ornament" style={{ "--delay": "0s" }}>
        <span className="text-6xl">🌺</span>
      </div>
      <div className="absolute top-30 right-10 w-24 h-24 opacity-15 ornament" style={{ "--delay": "1s" }}>
        <span className="text-5xl">🌴</span>
      </div>
      <div className="absolute bottom-20 left-15 w-28 h-28 opacity-15 ornament" style={{ "--delay": "2s" }}>
        <span className="text-5xl">🌊</span>
      </div>
      <div className="absolute top-40 right-20 w-20 h-20 opacity-15 ornament" style={{ "--delay": "0.5s" }}>
        <span className="text-4xl">馬</span>
      </div>
      <div className="absolute bottom-30 right-15 w-24 h-24 opacity-15 ornament" style={{ "--delay": "1.5s" }}>
        <span className="text-5xl">🍍</span>
      </div>
    </section>
  );
}; 
