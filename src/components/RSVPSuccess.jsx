import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Calendar, Clock, MapPin, Utensils, Users, ArrowRight, Plus, Mail } from 'lucide-react';
import { EVENT_CONFIG, DIETARY_OPTIONS } from '../constants';
import { ChristmasBackground } from './ChristmasBackground';

// Full-page confirmation shown after a successful RSVP
export const RSVPSuccess = ({ data, onAnother }) => {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const firstName = (data.name || '').trim().split(' ')[0] || 'friend';
  const attending = data.attendance === 'yes';
  const maybe = data.attendance === 'maybe';
  const foods = data.foodSelections || [];
  const guests = data.partyNames || [];
  const dietary = (data.dietaryRestrictions || []).map(id => DIETARY_OPTIONS.find(d => d.id === id)?.label || id);

  const title = attending ? `Mahalo, ${firstName}! You're on the list 🌺`
    : maybe ? `Thanks, ${firstName} - we've marked you as a maybe`
    : `We'll miss you, ${firstName}`;

  return (
    <section id="rsvp-success" className="relative min-h-screen pt-16 pb-12">
      <ChristmasBackground showSnow={true} showOrnaments={true} />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-xmas-gold text-xmas-night flex items-center justify-center shadow-lg shadow-xmas-gold/30">
            <Check className="w-9 h-9" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-xmas-cream mb-2">RSVP Submitted Successfully!</h1>
          <p className="text-xmas-gold font-display text-lg">{title}</p>
          <p className="mt-3 text-sm text-xmas-cream/70 flex items-center justify-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>
              {data.emailFailed
                ? "Your RSVP is saved, but we couldn't send the confirmation email. No worries, we received your response."
                : `A confirmation email is on its way to ${data.email}.`}
            </span>
          </p>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-display text-xl text-xmas-gold">Your RSVP</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-xmas-cream">
            <div><span className="text-xmas-cream/60">Name:</span> {data.name}</div>
            <div><span className="text-xmas-cream/60">Email:</span> {data.email}</div>
            <div><span className="text-xmas-cream/60">Attendance:</span> {attending ? 'Attending' : maybe ? 'Maybe' : 'Not attending'}</div>
            {data.attendance !== 'no' && (
              <div className="flex items-center space-x-1"><Users className="w-4 h-4 text-xmas-gold" /><span>Party of {data.partySize}</span></div>
            )}
            {guests.length > 0 && (
              <div className="sm:col-span-2"><span className="text-xmas-cream/60">Guests:</span> {guests.join(', ')}</div>
            )}
            {dietary.length > 0 && (
              <div className="sm:col-span-2"><span className="text-xmas-cream/60">Dietary:</span> {dietary.join(', ')}</div>
            )}
            {data.specialRequests && (
              <div className="sm:col-span-2"><span className="text-xmas-cream/60">Message:</span> {data.specialRequests}</div>
            )}
          </div>

          {foods.length > 0 && (
            <div className="border-t border-xmas-darkred/30 pt-4">
              <h3 className="flex items-center space-x-2 text-xmas-gold mb-2"><Utensils className="w-5 h-5" /><span className="font-display text-lg">You're bringing</span></h3>
              <ul className="space-y-1 text-sm text-xmas-cream">
                {foods.map((f, i) => (
                  <li key={i}>
                    <strong>{f.dishName || f.name}</strong>
                    {f.dishName && <span className="text-xmas-cream/60"> ({f.name})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {attending && (
          <div className="card p-5 mt-4">
            <h2 className="font-display text-xl text-xmas-gold mb-3">See you there</h2>
            <div className="grid gap-2 text-sm text-xmas-cream/90">
              <p className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-xmas-gold" /><span>{EVENT_CONFIG.date}</span></p>
              <p className="flex items-center space-x-2"><Clock className="w-4 h-4 text-xmas-gold" /><span>{EVENT_CONFIG.time}</span></p>
              <p className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-xmas-gold" /><span>{EVENT_CONFIG.address}</span></p>
              <p>👗 {EVENT_CONFIG.dressCode}</p>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-center text-xmas-cream/50">
          Need to change something? Submit again with the same email and your new answers will replace this RSVP.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/menu" className="btn-primary inline-flex items-center space-x-2 px-6 py-3">
            <span>View the Potluck Menu</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/" className="btn-secondary inline-flex items-center space-x-2 px-6 py-3">
            <span>Back to Home</span>
          </Link>
          <button type="button" onClick={onAnother} className="inline-flex items-center space-x-2 px-4 py-3 text-sm text-xmas-cream/70 hover:text-xmas-gold transition-colors">
            <Plus className="w-4 h-4" />
            <span>Submit another RSVP</span>
          </button>
        </div>
      </div>
    </section>
  );
};
