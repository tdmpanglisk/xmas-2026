import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X, User, Mail, Phone, Users, Utensils, Heart, AlertCircle, ChevronDown, ExternalLink, Sparkles, Users as UsersIcon, Star, Shield, Plus, BookOpen } from 'lucide-react';
import { ATTENDANCE_OPTIONS, PARTY_SIZE_OPTIONS, FOOD_CATEGORIES, DIETARY_OPTIONS, EVENT_CONFIG, RECIPE_DATA, POTLUCK_NOTE, HAWAIIAN_TIP, DISH_GUIDANCE } from '../constants';
import { saveRSVP, sendToGoogleSheets, getAllRSVPs, syncFromGoogleSheets } from '../utils/storage';
import { sendRSVPEmails } from '../utils/emailService';
import { ChristmasBackground } from './ChristmasBackground';
import { SuggestionChip } from './SuggestionChip';
import { RSVPSuccess } from './RSVPSuccess';

// 1 dish for parties of 1-3, 2 different dishes for parties of 4+
const requiredDishes = (partySize) => (partySize >= 4 ? 2 : 1);

// Drinks don't count toward the requirement
const countDishes = (data) => {
  const selected = data.foodSelections.filter(f => f.category !== 'drinks').length;
  const custom = data.customFood.trim() && data.customFoodCategory !== 'drinks' ? 1 : 0;
  return selected + custom;
};

export const RSVPForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    attendance: 'yes', partySize: 1, partyNames: [], foodSelections: [],
    dietaryRestrictions: [],
    specialRequests: '',
    customFood: '',
    customFoodCategory: 'sides',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [rsvps, setRsvps] = useState(() => getAllRSVPs());
  const [selectedFoodDetail, setSelectedFoodDetail] = useState(null);
  const [showRecipeIdeas, setShowRecipeIdeas] = useState(null); // category id

  // Load RSVPs on mount and sync
  useEffect(() => {
  if (step !== 3) return;
  let cancelled = false;
  const refresh = () => syncFromGoogleSheets().then(() => { if (!cancelled) setRsvps(getAllRSVPs()); });
  refresh();
  const t = setInterval(refresh, 20000);
  return () => { cancelled = true; clearInterval(t); };
}, [step]);

  const getFoodBringers = (food) => {
  const me = (formData.email || '').trim().toLowerCase();
  const bringers = [];
  rsvps.filter(r => r.attendance === 'yes').forEach(rsvp => {
    (rsvp.foodSelections || []).forEach(f => {
      if ((food.id && f.id === food.id) || f.name === food.name) {
        bringers.push({
          name: rsvp.name,
          dishName: f.dishName || '',
          isMe: !!me && (rsvp.email || '').toLowerCase() === me,
        });
      }
    });
  });
  return bringers;
};

  // Custom dishes other guests added, so they show in step 3 like they do on the menu
  const getCustomFoods = (categoryId) => {
    const me = (formData.email || '').trim().toLowerCase();
    const seen = new Set();
    const out = [];
    rsvps.filter(r => r.attendance === 'yes').forEach(rsvp => {
      if (me && (rsvp.email || '').toLowerCase() === me) return;
      (rsvp.foodSelections || []).forEach(f => {
        if (f.isCustom && f.category === categoryId && !seen.has(f.name)) {
          seen.add(f.name);
          out.push({ id: f.id, name: f.name, serves: f.serves || 1, isCustom: true });
        }
      });
    });
    return out;
  };

  const isHostProvided = (food) => {
    const recipe = RECIPE_DATA[food.id];
    return recipe?.isHostProvided || false;
  };

  const getRecipeData = (food) => RECIPE_DATA[food.id];

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (formData.phone && !/^[\d\s\-\+\(\)]{7,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    }
    if (currentStep === 2) {
      if (formData.attendance === 'yes' && formData.partySize < 1) newErrors.partySize = 'Party size required';
      if (formData.attendance !== 'no' && formData.partySize > 1) {
        const missing = Array.from({ length: formData.partySize - 1 }, (_, i) => i).some(i => !((formData.partyNames || [])[i] || '').trim());
        if (missing) newErrors.partyNames = 'Please enter a name for every guest in your party.';
      }
    }
    if (currentStep === 3 && formData.attendance === 'yes') {
      const needed = requiredDishes(formData.partySize);
      if (countDishes(formData) < needed) {
        newErrors.food = needed === 2
          ? 'Parties of 4 or more: please sign up for 2 different dishes (appetizer, protein, hot veggie, starch, or dessert).'
          : 'Please sign up for 1 dish (appetizer, protein, hot veggie, starch, or dessert).';
      }
    }
    if (currentStep === 3 && formData.attendance === 'yes' && !newErrors.food) {
      const unnamed = formData.foodSelections.find(f => !(f.dishName || '').trim());
      if (unnamed) newErrors.dishName = `Please add your dish name for "${unnamed.name}".`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleFoodSelection = (food) => {
    setFormData(prev => {
      const exists = prev.foodSelections.find(f => f.id === food.id);
      if (exists) return { ...prev, foodSelections: prev.foodSelections.filter(f => f.id !== food.id) };
      // Add new selection with empty dishName - user will fill it in
      return { ...prev, foodSelections: [...prev.foodSelections, { ...food, dishName: '' }] };
    });
  };

  const addFoodWithDish = (food, dishName) => {
    setFormData(prev => prev.foodSelections.some(f => f.id === food.id)
      ? prev
      : { ...prev, foodSelections: [...prev.foodSelections, { ...food, dishName }] });
  };

  const updateDishName = (foodId, dishName) => {
    setErrors(prev => ({ ...prev, dishName: '' }));
    setFormData(prev => ({
      ...prev,
      foodSelections: prev.foodSelections.map(f =>
        f.id === foodId ? { ...f, dishName } : f
      )
    }));
  };

  const handlePartyName = (index, value) => {
    setErrors(prev => ({ ...prev, partyNames: '' }));
    setFormData(prev => {
      const names = [...(prev.partyNames || [])];
      names[index] = value;
      return { ...prev, partyNames: names };
    });
  };

  const toggleDietary = (dietary) => {
    setFormData(prev => {
      const exists = prev.dietaryRestrictions.includes(dietary);
      return { ...prev, dietaryRestrictions: exists ? prev.dietaryRestrictions.filter(d => d !== dietary) : [...prev.dietaryRestrictions, dietary] };
    });
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsSubmitting(true);
    setSubmitResult(null);

    // Re-check availability right before saving so two guests can't claim the same slot
    try { await syncFromGoogleSheets(); } catch (err) { /* offline: fall back to what we have */ }
    const latest = getAllRSVPs();
    setRsvps(latest);
    const me = formData.email.trim().toLowerCase();
    const claimed = formData.foodSelections.filter(sel =>
      latest.some(r => r.attendance === 'yes' && (r.email || '').toLowerCase() !== me &&
        (r.foodSelections || []).some(f => f.id === sel.id || f.name === sel.name))
    );
    if (claimed.length > 0) {
      setFormData(prev => ({ ...prev, foodSelections: prev.foodSelections.filter(f => !claimed.some(c => c.id === f.id)) }));
      setSubmitResult({ success: false, message: `Sorry, ${claimed.map(c => c.name).join(', ')} was just claimed by another guest. It has been removed from your list - please pick another slot.` });
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Include custom food in foodSelections if provided
    const foodSelections = [...formData.foodSelections];
    if (formData.customFood && formData.customFood.trim()) {
      foodSelections.push({
        id: `custom-${Date.now()}`,
        name: formData.customFood.trim(),
        category: formData.customFoodCategory || 'sides',
        serves: 1,
        isCustom: true,
      });
    }

    // Only keep as many names as there are extra guests; drop blanks
    const partyNames = formData.attendance === 'no'
      ? []
      : Array.from({ length: Math.max(0, formData.partySize - 1) }, (_, i) => ((formData.partyNames || [])[i] || '').trim()).filter(Boolean);
    const rsvpData = { ...formData, partyNames, foodSelections, submittedAt: new Date().toISOString() };
    const saveResult = saveRSVP(rsvpData);
    if (!saveResult.success) {
      setSubmitResult({ success: false, message: 'Failed to save RSVP. Please try again.' });
      setIsSubmitting(false);
      return;
    }

    // Send to Google Sheets (non-blocking, best effort)
    if (typeof window !== 'undefined') {
      sendToGoogleSheets(rsvpData).then(sheetsResult => {
        if (!sheetsResult.success) console.info('Google Sheets backup skipped:', sheetsResult.error);
        else console.info('Google Sheets backup successful');
      }).catch(err => console.info('Sheets backup error (non-blocking):', err.message));
    }

    const emailResult = await sendRSVPEmails(rsvpData);
    if (emailResult.allSuccess || emailResult.guest.simulated) {
      setSubmitResult({ 
        success: true, 
        message: 'RSVP submitted successfully!',
        data: rsvpData // Store submitted data for display
      });
      setRsvps(getAllRSVPs());
      // Don't reset form or step - show success with submitted data
      // User can click "Submit Another RSVP" if needed
    } else {
      setSubmitResult({ success: true, message: 'RSVP submitted successfully!', data: rsvpData, emailFailed: true });
      setRsvps(getAllRSVPs());
    }
    setIsSubmitting(false);
  };

  const steps = [
    { number: 1, title: 'Your Info', icon: User },
    { number: 2, title: 'Attendance', icon: Users },
    { number: 3, title: 'Potluck & Details', icon: Utensils },
  ];

  // Food Detail Modal Component
  const FoodDetailModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedFoodDetail(null)}>
      <div className="bg-xmas-night border border-xmas-darkred/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-xmas-darkred/30">
          <h2 className="font-display text-xl text-xmas-gold">{selectedFoodDetail.food.name}</h2>
          <button onClick={() => setSelectedFoodDetail(null)} className="text-xmas-cream/60 hover:text-xmas-gold transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {selectedFoodDetail.recipeData?.imageUrl && (
            <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
              <img
                src={selectedFoodDetail.recipeData.imageUrl}
                alt={selectedFoodDetail.food.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = '/images/placeholder-food.jpg'; }}
              />
              {selectedFoodDetail.hostProvided && (
                <div className="absolute top-3 right-3 bg-xmas-gold text-xmas-night px-2 py-0.5 rounded text-xs font-bold">HOST PROVIDED</div>
              )}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{FOOD_CATEGORIES.find(c => c.name === selectedFoodDetail.category)?.icon}</span>
            <span className="text-xmas-cream/70">{selectedFoodDetail.category}</span>
            {selectedFoodDetail.hostProvided && !selectedFoodDetail.recipeData?.imageUrl && <span className="bg-xmas-gold text-xmas-night px-2 py-0.5 rounded text-xs font-bold">HOST PROVIDED</span>}
          </div>
          <p className="text-xmas-cream">Serves <strong>{selectedFoodDetail.food.serves}</strong> people</p>
          {selectedFoodDetail.recipeData && (
            <>
              {selectedFoodDetail.recipeData.description && (
                <div className="bg-xmas-cream/5 border border-xmas-cream/20 rounded-lg p-4">
                  <h3 className="font-display text-lg text-xmas-gold mb-2">Description</h3>
                  <p className="text-xmas-cream">{selectedFoodDetail.recipeData.description}</p>
                </div>
              )}
              {selectedFoodDetail.recipeData.recipes && selectedFoodDetail.recipeData.recipes.length > 0 && (
                <div className="bg-xmas-green/5 border border-xmas-green/20 rounded-lg p-4">
                  <h3 className="flex items-center space-x-2 text-xmas-green mb-2"><Sparkles className="w-5 h-5" /><span className="font-display text-lg">Recipes</span></h3>
                  <ul className="space-y-2">
                    {selectedFoodDetail.recipeData.recipes.map((r, i) => (
                      <li key={i} className="text-xmas-cream">
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-xmas-gold transition-colors">
                          <ExternalLink className="w-4 h-4" /> {r.name} ({r.source})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedFoodDetail.recipeData.variations && selectedFoodDetail.recipeData.variations.length > 0 && (
                <div className="bg-xmas-gold/5 border border-xmas-gold/20 rounded-lg p-4">
                  <h3 className="flex items-center space-x-2 text-xmas-gold mb-2"><Star className="w-5 h-5" /><span className="font-display text-lg">Variations</span></h3>
                  <ul className="space-y-1 list-disc list-inside text-xmas-cream">
                    {selectedFoodDetail.recipeData.variations.map((v, i) => <li key={i}>{v}</li>)}
                  </ul>
                </div>
              )}
              {selectedFoodDetail.recipeData.notes && (
                <div className="bg-xmas-cream/5 border border-xmas-cream/20 rounded-lg p-4">
                  <h3 className="flex items-center space-x-2 text-xmas-gold mb-2"><Star className="w-5 h-5" /><span className="font-display text-lg">Notes</span></h3>
                  <p className="text-xmas-cream">{selectedFoodDetail.recipeData.notes}</p>
                </div>
              )}
            </>
          )}
          {(() => {
            const cat = FOOD_CATEGORIES.find(c => c.name === selectedFoodDetail.category);
            const ideas = (cat?.recipeSuggestions || []).filter(s => !selectedFoodDetail.food.keywords || selectedFoodDetail.food.keywords.some(k => s.toLowerCase().includes(k)));
            return ideas.length > 0 && !(selectedFoodDetail.recipeData?.recipes?.length > 0) ? (
              <div className="bg-xmas-gold/5 border border-xmas-gold/20 rounded-lg p-4">
                <h3 className="flex items-center space-x-2 text-xmas-gold mb-2"><BookOpen className="w-5 h-5" /><span className="font-display text-lg">Recipe ideas</span></h3>
                <p className="text-xs text-xmas-cream/70 mb-2">{HAWAIIAN_TIP}</p>
                <div className="flex flex-wrap gap-2">
                  {ideas.map((s, i) => <SuggestionChip key={i} suggestion={s} />)}
                </div>
              </div>
            ) : null;
          })()}
          {selectedFoodDetail.bringers.length > 0 && (
            <div className="bg-xmas-green/10 border border-xmas-green/30 rounded-xl p-4">
              <h3 className="flex items-center space-x-2 text-xmas-green mb-2"><UsersIcon className="w-5 h-5" /><span className="font-display text-lg">Bringing this dish</span></h3>
              <div className="flex flex-wrap gap-2">
                {selectedFoodDetail.bringers.map((b, i) => (
                  <span key={i} className="px-3 py-1 bg-xmas-green/20 text-xmas-green rounded-full text-sm font-medium">{b.dishName ? <>{b.dishName} <span className="text-xmas-cream/70">- {b.name}</span></> : b.name}</span>
                ))}
              </div>
            </div>
          )}
          {selectedFoodDetail.bringers.length === 0 && !selectedFoodDetail.hostProvided && (
            <div className="bg-xmas-cream/10 border border-xmas-cream/20 rounded-xl p-4 text-center">
              <p className="text-xmas-cream/70">No one has signed up for this dish yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const resetForm = () => {
    setSubmitResult(null);
    setErrors({});
    setFormData({
      name: '', email: '', phone: '',
      attendance: 'yes', partySize: 1, partyNames: [], foodSelections: [], dietaryRestrictions: [],
      specialRequests: '', customFood: '', customFoodCategory: 'sides',
    });
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitResult?.success && submitResult.data) {
    return <RSVPSuccess data={submitResult.data} onAnother={resetForm} />;
  }

  return (
    <>
      <section id="rsvp" className="relative min-h-screen pt-12 pb-12">
        <ChristmasBackground showSnow={true} showOrnaments={false} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <div className="flex items-center justify-center mb-2">
              {steps.map((s, i) => (
                <React.Fragment key={s.number}>
                  <div className="flex items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold transition-all ${step >= s.number ? 'bg-xmas-gold text-xmas-night' : 'bg-xmas-darkred/50 text-xmas-cream/50 border border-xmas-darkred'}`}>
                      {step > s.number ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                    </div>
                    {i < steps.length - 1 && <div className={`w-12 h-1 mx-2 transition-colors ${step > i + 1 ? 'bg-xmas-gold' : 'bg-xmas-darkred/30'}`} />}
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="text-center text-sm text-xmas-cream/70">Step {step} of 3: {steps[step - 1].title}</div>
            <div className="mb-2 p-2 rounded-xl bg-xmas-gold/10 border border-xmas-gold/30 text-sm text-xmas-cream">{DISH_GUIDANCE}</div>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
            {submitResult && (
              <div className={`p-4 rounded-xl ${submitResult.success ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-red-900/30 border-red-500/50 text-red-300'} flex flex-col space-y-3`}>
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{submitResult.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}</div>
                  <p>{submitResult.message}</p>
                </div>
                
                {submitResult.success && submitResult.data && (
                  <div className="border-t border-green-500/30 pt-3 space-y-2 text-sm">
                    <h4 className="font-semibold text-green-300">Submitted Details:</h4>
                    <div className="grid sm:grid-cols-2 gap-2 text-green-100">
                      <div><span className="text-green-400">Name:</span> {submitResult.data.name}</div>
                      <div><span className="text-green-400">Email:</span> {submitResult.data.email}</div>
                      <div><span className="text-green-400">Attendance:</span> {submitResult.data.attendance === 'yes' ? 'Attending' : submitResult.data.attendance === 'maybe' ? 'Maybe' : 'Not Attending'}</div>
                      <div><span className="text-green-400">Party Size:</span> {submitResult.data.partySize}</div>
                      {(submitResult.data.partyNames || []).length > 0 && (
                        <div className="sm:col-span-2"><span className="text-green-400">Guests:</span> {submitResult.data.partyNames.join(', ')}</div>
                      )}
                      {submitResult.data.foodSelections && submitResult.data.foodSelections.length > 0 && (
                        <div className="sm:col-span-2">
                          <span className="text-green-400">Food Bringing:</span>
                          <ul className="list-disc list-inside mt-1 ml-4">
                            {submitResult.data.foodSelections.map((f, i) => (
                              <li key={i}>{f.name}{f.dishName && ` - ${f.dishName}`} ({f.category})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitResult(null);
                        setFormData({
                          name: '', email: '', phone: '',
                          attendance: 'yes', partySize: 1, partyNames: [], foodSelections: [], dietaryRestrictions: [],
                          specialRequests: '', customFood: '', customFoodCategory: 'sides',
                        });
                        setStep(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="mt-4 px-6 py-2 bg-xmas-gold text-xmas-night font-semibold rounded-lg hover:bg-xmas-gold/80 transition-colors inline-flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Submit Another RSVP</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-4">
                  <h2 className="section-title !text-2xl md:!text-3xl">Tell Us About Yourself</h2>
                  <p className="text-xmas-cream/70">We'll use this to send your confirmation and updates</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="label"><User className="w-4 h-4 inline mr-1" /> Full Name *</label>
                    <input type="text" id="name" className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`} value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="John Doe" required autoComplete="name" />
                    {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="label"><Mail className="w-4 h-4 inline mr-1" /> Email Address *</label>
                    <input type="email" id="email" className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`} value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="john@example.com" required autoComplete="email" />
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="label"><Phone className="w-4 h-4 inline mr-1" /> Phone Number (optional)</label>
                  <input type="tel" id="phone" className={`input-field ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`} value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="(555) 123-4567" autoComplete="tel" />
                  {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center mb-4">
                  <h2 className="section-title !text-2xl md:!text-3xl">Will You Be Joining Us?</h2>
                  <p className="text-xmas-cream/70">Let us know if you can make it to the celebration</p>
                </div>
                <div className="grid gap-4">
                  {ATTENDANCE_OPTIONS.map((option) => (
                    <label key={option.id} className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.attendance === option.id ? 'border-xmas-gold bg-xmas-gold/10' : 'border-xmas-darkred/30 hover:border-xmas-gold/50'}`}>
                      <input type="radio" name="attendance" value={option.id} checked={formData.attendance === option.id} onChange={() => handleChange('attendance', option.id)} className="sr-only" />
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${formData.attendance === option.id ? 'bg-xmas-gold text-xmas-night' : 'bg-xmas-darkred/50 text-xmas-cream/50'}`}>
                          {option.id === 'yes' && <Heart className="w-6 h-6" />}{option.id === 'maybe' && <AlertCircle className="w-6 h-6" />}{option.id === 'no' && <X className="w-6 h-6" />}
                        </div>
                        <span className="text-lg font-medium text-xmas-cream">{option.label}</span>
                      </div>
                      {formData.attendance === option.id && <div className="absolute top-2 right-2 w-5 h-5 bg-xmas-gold text-xmas-night rounded-full flex items-center justify-center"><Check className="w-3 h-3" /></div>}
                    </label>
                  ))}
                </div>
                {formData.attendance !== 'no' && (
                  <div>
                    <label className="label"><Users className="w-4 h-4 inline mr-1" /> How many in your party? *</label>
                    <select className={`input-field appearance-none ${errors.partySize ? 'border-red-500 focus:ring-red-500' : ''}`} value={formData.partySize} onChange={e => handleChange('partySize', parseInt(e.target.value))} required={formData.attendance === 'yes'}>
                      {PARTY_SIZE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.partySize && <p className="mt-1 text-sm text-red-400">{errors.partySize}</p>}
                    {formData.partySize > 1 && (
                      <div className="mt-4">
                        <label className="label">Names of your guests *</label>
                        {errors.partyNames && <p className="mb-2 text-sm text-red-400">{errors.partyNames}</p>}
                        <div className="grid sm:grid-cols-2 gap-3">
                          {Array.from({ length: formData.partySize - 1 }, (_, i) => (
                            <input
                              key={i}
                              type="text"
                              className={`input-field ${errors.partyNames && !((formData.partyNames || [])[i] || '').trim() ? 'border-red-500 focus:ring-red-500' : ''}`}
                              placeholder={`Guest ${i + 2} name`}
                              value={(formData.partyNames || [])[i] || ''}
                              onChange={e => handlePartyName(i, e.target.value)}
                              autoComplete="off"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {formData.attendance === 'no' && (
                  <div className="p-4 bg-xmas-red/10 border border-xmas-red/30 rounded-xl text-center">
                    <p className="text-xmas-cream">We'll miss you! Feel free to still submit the form so we know you received the invite.</p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center mb-4">
                  <h2 className="section-title !text-2xl md:!text-3xl">Potluck Sign-Up & Details</h2>
                  <p className="text-xmas-cream/70">Choose what you'd like to bring</p>
                </div>

                {formData.attendance === 'yes' && (() => {
                  const needed = requiredDishes(formData.partySize);
                  const have = countDishes(formData);
                  const short = have < needed;
                  return (
                    <div className="space-y-4">
                      {/* Potluck Note */}
                      <div className="p-4 rounded-xl bg-xmas-green/10 border border-xmas-green/30 text-xmas-cream">
                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: POTLUCK_NOTE }} />
                      </div>
                      {/* Required dishes message */}
                      <div className={`p-4 rounded-xl border text-sm ${(errors.food && short) || errors.dishName ? 'bg-red-900/30 border-red-500/50 text-red-300' : 'bg-xmas-gold/10 border-xmas-gold/30 text-xmas-cream'}`}>
                        <strong>Required:</strong> {needed} {needed === 1 ? 'dish' : 'different dishes'} for your party of {formData.partySize}
                        {' '}(appetizer, protein, hot veggie, starch, or dessert). Selected: {have}/{needed}
                        {errors.food && short && <p className="mt-1">{errors.food}</p>}
                        {errors.dishName && <p className="mt-1">{errors.dishName}</p>}
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-6">
                  {FOOD_CATEGORIES.map((category) => (
                    <div key={category.id} className="card p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="flex items-center space-x-2 text-xmas-gold"><span className="text-2xl">{category.icon}</span><span className="font-display text-xl">{category.name}</span></h3>
                        {category.recipeSuggestions && category.recipeSuggestions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowRecipeIdeas(showRecipeIdeas === category.id ? null : category.id)}
                            className="text-xmas-gold/80 hover:text-xmas-gold text-xs font-medium flex items-center space-x-1 px-2 py-1 rounded border border-xmas-gold/30 bg-xmas-gold/5 transition-colors"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Recipe Ideas</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showRecipeIdeas === category.id ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Recipe Ideas Dropdown */}
                      {showRecipeIdeas === category.id && category.recipeSuggestions && (
                        <div className="mb-4 p-3 bg-xmas-night/50 border border-xmas-gold/20 rounded-lg animate-fade-in">
                          <p className="text-xs text-xmas-cream/60 mb-2">Tap "Use this dish" to fill a free slot, or open a recipe link. You can also type your own dish name on any slot:</p>
                          <div className="flex flex-wrap gap-2">
                            {category.recipeSuggestions.map((suggestion, idx) => (
                              <SuggestionChip
                                key={idx}
                                suggestion={suggestion}
                                onUse={() => {
                                  const free = category.options.filter(opt =>
                                    !formData.foodSelections.some(f => f.id === opt.id) &&
                                    !isHostProvided({ ...opt, category: category.id }) &&
                                    getFoodBringers({ ...opt, category: category.id }).filter(b => !b.isMe).length === 0
                                  );
                                  // Slots with keywords (Protein: fish / chicken / tofu) only take matching ideas
                                  const slot = free.find(opt => opt.keywords && opt.keywords.some(k => suggestion.toLowerCase().includes(k))) || free.find(opt => !opt.keywords);
                                  if (slot) addFoodWithDish({ ...slot, category: category.id }, suggestion);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="mb-3 text-xs text-xmas-gold/80">💡 Tip: {HAWAIIAN_TIP}</p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[...category.options, ...getCustomFoods(category.id)].map((food) => {
                          const foodWithCategory = { ...food, category: category.id };
                          const selectedFood = formData.foodSelections.find(f => f.id === food.id);
                          const isSelected = !!selectedFood;
                          const bringers = getFoodBringers(foodWithCategory);
                          const hostProvided = isHostProvided(foodWithCategory);
                          const recipeData = getRecipeData(foodWithCategory);
                          const takenByOthers = bringers.filter(b => !b.isMe);
                          const isTaken = takenByOthers.length > 0;
                          const isMineSaved = bringers.some(b => b.isMe);
                          const isDisabled = isTaken || hostProvided;
                          const dishName = selectedFood?.dishName || '';

                          const dietaryTags = recipeData?.dietaryTags || [];
                          const imageUrl = recipeData?.imageUrl;

                          return (
                            <div key={food.id} className="relative group">
                              {isTaken && (
                                <div className="absolute top-2 right-2 z-10 max-w-[80%] bg-xmas-green text-xmas-night px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 shadow">
                                  <UsersIcon className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">TAKEN - {takenByOthers[0].name}</span>
                                </div>
                              )}
                              {(isSelected || isMineSaved) && !isTaken && (
                                <div className="absolute top-2 right-2 z-10 bg-xmas-gold text-xmas-night px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 shadow">
                                  <Check className="w-3 h-3" />
                                  <span>YOURS</span>
                                </div>
                              )}
                              <label className={`block cursor-pointer rounded-lg border-2 transition-all overflow-hidden ${isSelected ? 'border-xmas-gold bg-xmas-gold/10' : isDisabled ? 'border-xmas-darkred/30 bg-xmas-night/50 opacity-60 cursor-not-allowed' : 'border-xmas-darkred/30 hover:border-xmas-gold/50'}`}>
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={isSelected}
                                  disabled={isDisabled && !isSelected}
                                  onChange={() => toggleFoodSelection(foodWithCategory)}
                                />
                                {imageUrl && (
                                  <div className="relative h-24 md:h-28">
                                    <img
                                      src={imageUrl}
                                      alt={foodWithCategory.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                                <div className="p-3">
                                  <div className="flex items-start space-x-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors flex-shrink-0 ${isSelected ? 'border-xmas-gold bg-xmas-gold text-xmas-night' : isDisabled ? 'border-xmas-darkred/30 bg-xmas-night/50' : 'border-xmas-darkred/50'}`}>
                                      {isSelected && <Check className="w-3 h-3" />}
                                      {isDisabled && !isSelected && !hostProvided && <UsersIcon className="w-3 h-3 text-xmas-cream/50" />}
                                      {hostProvided && !isSelected && <Shield className="w-3 h-3 text-xmas-gold" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-medium break-words ${isDisabled ? 'text-xmas-cream/60' : 'text-xmas-cream'}`}>
                                        {foodWithCategory.name}
                                      </p>
                                      <p className="text-xs text-xmas-cream/50">Serves ~{foodWithCategory.serves} people</p>
                                      {recipeData?.recipes?.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                          {recipeData.recipes.slice(0, 2).map((r, i) => (
                                            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center space-x-1 text-xs text-xmas-cream/70 hover:text-xmas-gold hover:underline">
                                              <ExternalLink className="w-3 h-3" /><span>{r.name}</span>
                                            </a>
                                          ))}
                                        </div>
                                      )}

                                      {hostProvided && (
                                        <span className="inline-block mt-1 bg-xmas-gold text-xmas-night px-2 py-0.5 rounded text-xs font-bold">HOST PROVIDED</span>
                                      )}
                                      {bringers.length > 0 && (
                                        <p className="mt-1 text-xs text-xmas-green flex items-start space-x-1">
                                          <UsersIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                          <span className="break-words">Bringing: {bringers.map(b => (b.dishName ? `${b.dishName} (${b.name})` : b.name)).join(', ')}</span>
                                        </p>
                                      )}

                                      {dietaryTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {dietaryTags.map((tag) => {
                                            const dietaryOption = DIETARY_OPTIONS.find(d => d.id === tag);
                                            return dietaryOption ? (
                                              <span key={tag} className="inline-flex items-center space-x-1 px-2 py-0.5 bg-xmas-green/20 text-xmas-green text-xs rounded-full border border-xmas-green/30" title={dietaryOption.label}>
                                                <span className="text-xs">{dietaryOption.icon}</span>
                                                <span className="font-medium">{dietaryOption.label}</span>
                                              </span>
                                            ) : null;
                                          })}
                                        </div>
                                      )}

                                      {/* Dish Name Input - shown when selected */}
                                      {isSelected && (
                                        <div className="mt-2">
                                          <span className="block text-xs text-xmas-cream/60 mb-1">Your Dish Name (required):</span>
                                          <input
                                            type="text"
                                            value={dishName}
                                            onChange={(e) => updateDishName(food.id, e.target.value)}
                                            placeholder={food.dishPlaceholder || category.dishPlaceholder || 'Name your dish'}
                                            className="w-full px-3 py-1.5 bg-xmas-night/50 border border-xmas-gold/30 rounded-lg text-xmas-cream placeholder-xmas-cream/40 text-sm focus:outline-none focus:border-xmas-gold focus:ring-1 focus:ring-xmas-gold"
                                            maxLength={50}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </label>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-xmas-darkred/30 px-3">
                                <span className="text-xmas-gold font-medium text-sm">Serves {foodWithCategory.serves}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedFoodDetail({ food: foodWithCategory, category: category.name, bringers, hostProvided, recipeData });
                                  }}
                                  className="text-xmas-cream/50 hover:text-xmas-gold text-xs flex items-center space-x-1"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                  <span>Details</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card p-4">
                  <h3 className="flex items-center space-x-2 text-xmas-gold mb-4"><span className="text-2xl">🌱</span><span className="font-display text-xl">Dietary Restrictions</span></h3>
                  <div className="flex flex-wrap gap-3">
                    {DIETARY_OPTIONS.map((dietary) => {
                      const isSelected = formData.dietaryRestrictions.includes(dietary.id);
                      return (
                        <label key={dietary.id} className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full cursor-pointer transition-all border ${isSelected ? 'bg-xmas-gold/20 border-xmas-gold text-xmas-gold' : 'bg-xmas-darkred/30 border-xmas-darkred/50 text-xmas-cream/70 hover:border-xmas-gold/50'}`}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleDietary(dietary.id)} className="sr-only" />
                          <span className="text-lg">{dietary.icon}</span><span className="text-sm font-medium">{dietary.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label htmlFor="specialRequests" className="label"><Heart className="w-4 h-4 inline mr-1" /> Special Requests or Message</label>
                  <textarea id="specialRequests" className="input-field min-h-[100px] resize-y" value={formData.specialRequests} onChange={e => handleChange('specialRequests', e.target.value)} placeholder="Any allergies, seating preferences, song requests, or a holiday message for the hosts..." />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-xmas-darkred/30">
              <button type="button" onClick={prevStep} disabled={step === 1} className={`btn-secondary ${step === 1 ? 'opacity-50 pointer-events-none' : ''}`}><ChevronLeft className="w-5 h-5 mr-2" /> Back</button>
              <div className="flex space-x-4">
                {step < 3 && <button type="button" onClick={nextStep} className="btn-primary">Next <ChevronRight className="w-5 h-5 ml-2" /></button>}
                {step === 3 && <button type="submit" disabled={isSubmitting} className="btn-gold">{isSubmitting ? 'Submitting...' : 'Submit RSVP'}</button>}
              </div>
            </div>
          </form>

          <div className="mt-12 p-6 card text-center">
            <h3 className="font-display text-xl text-xmas-gold mb-4">Event Details</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-xmas-cream/80">
              <p><strong>📅 Date:</strong> {EVENT_CONFIG.date}</p>
              <p><strong>🕕 Time:</strong> {EVENT_CONFIG.time}</p>
              <p><strong>📍 Location:</strong> {EVENT_CONFIG.address}</p>
              <p><strong>👗 Dress Code:</strong> {EVENT_CONFIG.dressCode}</p>
              <p><strong>⏰ RSVP By:</strong> {EVENT_CONFIG.rsvpDeadline}</p>
            </div>
          </div>
        </div>
      </section>

      {selectedFoodDetail && <FoodDetailModal />}
    </>
  );
};
