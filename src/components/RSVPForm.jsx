import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X, User, Mail, Phone, Users, Utensils, Heart, AlertCircle, ChevronDown, ExternalLink, Sparkles, Users as UsersIcon, Star, Shield } from 'lucide-react';
import { ATTENDANCE_OPTIONS, PARTY_SIZE_OPTIONS, FOOD_CATEGORIES, DIETARY_OPTIONS, EVENT_CONFIG, RECIPE_DATA } from '../constants';
import { saveRSVP, sendToGoogleSheets, getAllRSVPs, syncFromGoogleSheets } from '../utils/storage';
import { sendRSVPEmails } from '../utils/emailService';
import { ChristmasBackground } from './ChristmasBackground';

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

  // Load RSVPs on mount and sync
  useEffect(() => {
    setRsvps(getAllRSVPs());
    syncFromGoogleSheets().then(() => setRsvps(getAllRSVPs()));
  }, []);

  const getFoodBringers = (food) => {
    const bringers = [];
    const attendingRsvps = rsvps.filter(r => r.attendance === 'yes');

    attendingRsvps.forEach(rsvp => {
      rsvp.foodSelections.forEach(f => {
        // Primary match by food ID, fallback by name
        const matchById = food.id && f.id === food.id;
        const matchByName = f.name === food.name;
        if (matchById || matchByName) bringers.push(rsvp.name);
      });
    });
    return bringers;
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
    }
    if (currentStep === 3 && formData.attendance === 'yes') {
      const needed = requiredDishes(formData.partySize);
      if (countDishes(formData) < needed) {
        newErrors.food = needed === 2
          ? 'Parties of 4 or more: please sign up for 2 different dishes (appetizer, main, side, or dessert).'
          : 'Please sign up for 1 dish (appetizer, main, side, or dessert).';
      }
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
      return { ...prev, foodSelections: [...prev.foodSelections, food] };
    });
  };

  const handlePartyName = (index, value) => {
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
      setSubmitResult({ success: true, message: 'RSVP submitted successfully!' });
      setFormData({
        name: '', email: '', phone: '',
        attendance: 'yes', partySize: 1, partyNames: [], foodSelections: [], dietaryRestrictions: [],
        specialRequests: '', customFood: '', customFoodCategory: 'sides',
      });
      setRsvps(getAllRSVPs());
      setStep(1);
    } else {
      setSubmitResult({ success: false, message: 'RSVP saved but email notification failed. We\'ll still receive your response!' });
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
            <span className="text-2xl">{selectedFoodDetail.category === 'Pūpū (Appetizers)' && '🥢'}{selectedFoodDetail.category === 'Mea ʻAi Nui (Main Dishes) - The Kalua Pig' && '🐷'}{selectedFoodDetail.category === 'Sides & Starches' && '🍚'}{selectedFoodDetail.category === 'Mea ʻOno (Desserts)' && '🍰'}{selectedFoodDetail.category === 'Inu (Drinks)' && '🍹'}</span>
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
          {selectedFoodDetail.bringers.length > 0 && (
            <div className="bg-xmas-green/10 border border-xmas-green/30 rounded-xl p-4">
              <h3 className="flex items-center space-x-2 text-xmas-green mb-2"><UsersIcon className="w-5 h-5" /><span className="font-display text-lg">Bringing this dish</span></h3>
              <div className="flex flex-wrap gap-2">
                {selectedFoodDetail.bringers.map((name, i) => (
                  <span key={i} className="px-3 py-1 bg-xmas-green/20 text-xmas-green rounded-full text-sm font-medium">{name}</span>
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
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
            {submitResult && (
              <div className={`p-4 rounded-xl ${submitResult.success ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-red-900/30 border-red-500/50 text-red-300'} flex items-start space-x-3`}>
                <div className="mt-1">{submitResult.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}</div>
                <p>{submitResult.message}</p>
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
                        <label className="label">Names of your guests (optional)</label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {Array.from({ length: formData.partySize - 1 }, (_, i) => (
                            <input
                              key={i}
                              type="text"
                              className="input-field"
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
                    <div className={`p-4 rounded-xl border text-sm ${errors.food && short ? 'bg-red-900/30 border-red-500/50 text-red-300' : 'bg-xmas-gold/10 border-xmas-gold/30 text-xmas-cream'}`}>
                      <strong>Required:</strong> {needed} {needed === 1 ? 'dish' : 'different dishes'} for your party of {formData.partySize}
                      {' '}(appetizer, main, side, or dessert; drinks don't count). Selected: {have}/{needed}
                      {errors.food && short && <p className="mt-1">{errors.food}</p>}
                    </div>
                  );
                })()}

                <div className="space-y-6">
                  {FOOD_CATEGORIES.map((category) => (
                    <div key={category.id} className="card p-4">
                      <h3 className="flex items-center space-x-2 text-xmas-gold mb-4"><span className="text-2xl">{category.icon}</span><span className="font-display text-xl">{category.name}</span></h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.options.map((food) => {
                          const foodWithCategory = { ...food, category: category.id };
                          const isSelected = formData.foodSelections.some(f => f.id === food.id);
                          const bringers = getFoodBringers(foodWithCategory);
                          const hostProvided = isHostProvided(foodWithCategory);
                          const recipeData = getRecipeData(foodWithCategory);
                          const isTaken = bringers.length > 0;
                          const isDisabled = isTaken || hostProvided;

                          const dietaryTags = recipeData?.dietaryTags || [];
                          const imageUrl = recipeData?.imageUrl;

                          return (
                            <div key={food.id} className="relative group">
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

                                      {hostProvided && (
                                        <span className="inline-block mt-1 bg-xmas-gold text-xmas-night px-2 py-0.5 rounded text-xs font-bold">HOST PROVIDED</span>
                                      )}
                                      {bringers.length > 0 && (
                                        <p className="mt-1 text-xs text-xmas-green flex items-start space-x-1">
                                          <UsersIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                          <span className="break-words">Bringing: {bringers.join(', ')}</span>
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

                {/* Custom Food Option */}
                <div className="card p-4">
                  <h3 className="flex items-center space-x-2 text-xmas-gold mb-4">
                    <span className="text-2xl">🌺</span>
                    <span className="font-display text-xl">Add Your Own Dish</span>
                  </h3>
                  <p className="text-xmas-cream/70 text-sm mb-3">
                    Don't see what you want to bring? Add a custom dish!{' '}
                    <span className="text-xmas-gold font-medium">💡 Tip:</span> Make it Hawaiian-style - think kalua pig, poke, haupia, malasadas, poi, lomi salmon, or any tropical twist!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="Enter your custom dish (e.g., 'Grandma&apos;s Pineapple Fried Rice')"
                      value={formData.customFood}
                      onChange={e => handleChange('customFood', e.target.value)}
                    />
                    <select
                      className="input-field w-auto"
                      value={formData.customFoodCategory || 'sides'}
                      onChange={e => handleChange('customFoodCategory', e.target.value)}
                    >
                      <option value="appetizers">🥥 Pūpū (Appetizers)</option>
                      <option value="mains">🐷 Mea ʻAi Nui (Main Dishes)</option>
                      <option value="sides">🍠 Sides & Starches</option>
                      <option value="desserts">🍍 Mea ʻOno (Desserts)</option>
                      <option value="drinks">🍹 Inu (Drinks)</option>
                    </select>
                  </div>
                  <p className="text-xs text-xmas-cream/50 mt-2">
                    Your custom dish will appear in the selected category for others to see.
                  </p>
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
