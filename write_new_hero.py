import base64

# Part 1
part1 = """import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { EVENT_CONFIG } from '../constants';
import { ChristmasBackground } from './ChristmasBackground';

const EventDetailItem = ({ icon, label, value }) => (
  <div className="flex flex-col items-center p-4 bg-xmas-night/40 backdrop-blur-sm border border-xmas-darkred/20 rounded-xl hover:border-xmas-gold/30 transition-colors">
    <div className="text-xmas-gold mb-2">{icon}</div>
    <div className="text-xs text-xmas-cream/50 uppercase tracking-wider">{label}</div>
    <div className="text-sm font-medium text-xmas-cream text-center">{value}</div>
  </div>
);

const TimeUnit = ({ value, label }) => (
  <div className="text-center">
    <div className="font-display text-3xl md:text-4xl font-bold text-xmas-gold tabular-nums">{value}</div>
    <div className="text-xs text-xmas-cream/60 uppercase tracking-wider">{label}</div>
  </div>
);

export const Hero = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date("December 20, 2026 17:00:00").getTime();
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
  }, []);"""
# Part 2
part2 = """  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <ChristmasBackground showSnow={false} showOrnaments={true} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-xmas-gold to-transparent" />
            <span className="text-4xl animate-pulse-slow">🌺</span>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-xmas-gold to-transparent" />
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-xmas-cream mb-6 leading-tight text-balance">
            Mah Family Hawaiian Christmas 2026
            <br />
            <span className="text-xmas-gold">馬家 聖誕快樂</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-xmas-cream/80 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Join us for a tropical holiday celebration with Kālua Pig, poi, haupia, and aloha spirit. 
            Bring your leis, wear your best aloha shirts, and let's make memories under the palms!
          </p>

          <div className="flex items-center justify-center space-x-8 mb-12 flex-wrap">
            <div className="bg-xmas-night/50 backdrop-blur-sm border-2 border-xmas-gold/50 rounded-2xl p-6">
              <div className="text-8xl animate-float">🐷🌺</div>
              <p className="text-xmas-gold font-medium mt-2">Kālua Pig with Lei</p>
            </div>
            <div className="bg-xmas-night/50 backdrop-blur-sm border-2 border-xmas-gold/50 rounded-2xl p-6">
              <div className="text-8xl animate-float" style={{animationDelay: "1s"}}>馬</div>
              <p className="text-xmas-gold font-medium mt-2">馬 — Year of the Horse</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-12 p-6 bg-xmas-night/50 backdrop-blur-sm border border-xmas-darkred/30 rounded-2xl max-w-md mx-auto">
            <TimeUnit value={timeLeft.days} label="Days" />
            <span className="text-xmas-gold text-2xl">:</span>
            <TimeUnit value={String(timeLeft.hours).padStart(2, "0")} label="Hours" />
            <span className="text-xmas-gold text-2xl">:</span>
            <TimeUnit value={String(timeLeft.minutes).padStart(2, "0")} label="Minutes" />
            <span className="text-xmas-gold text-2xl">:</span>
            <TimeUnit value={String(timeLeft.seconds).padStart(2, "0")} label="Seconds" />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/rsvp" className="btn-primary group inline-flex items-center space-x-2 text-lg px-10 py-4">
              <span>RSVP Now</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link to="/menu" className="btn-secondary inline-flex items-center space-x-2 text-lg px-10 py-4">
              <span>View Luau Menu</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            <EventDetailItem icon={<Calendar className="w-6 h-6" />} label="Date" value={EVENT_CONFIG.date} />
            <EventDetailItem icon={<Clock className="w-6 h-6" />} label="Time" value={EVENT_CONFIG.time} />
            <EventDetailItem icon={<MapPin className="w-6 h-6" />} label="Location" value={EVENT_CONFIG.address} />
            <EventDetailItem icon={<Users className="w-6 h-6" />} label="Guests" value={"Up to " + EVENT_CONFIG.maxGuests} />
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-xmas-cream/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-xmas-gold rounded-full animate-scroll-down" />
          </div>
        </div>
      </div>

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
};"""

# Combine parts
new_content = part1 + part2

# Encode and write
encoded = base64.b64encode(new_content.encode('utf-8')).decode('ascii')
with open('hero_b64_new.txt', 'w') as f:
    f.write(encoded)
print('encoded length:', len(encoded))
print('Done')