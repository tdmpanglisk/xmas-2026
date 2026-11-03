#!/usr/bin/env node
// Run AFTER apply-potluck-fixes.mjs and apply-potluck-fixes-2.mjs, from the project root:
//   node apply-potluck-fixes-4.mjs        (add --dry to only check)
//
//  - New Protein section: Fish / Chicken / Hot Tofu (one slot each, with matching recipe ideas + links)
//  - Third Appetizer slot
//  - After a successful RSVP the guest sees a full confirmation page (new RSVPSuccess.jsx) instead of an inline message
//  - Claimed slots: greyed out + a green "TAKEN - name" badge in step 3 (your own pick shows "YOURS"),
//    and availability is re-checked against the Google Sheet right before submitting so two people can't claim the same slot
//  - Guidance at the top of the RSVP page and the menu: each couple brings a dish, everyone over 18 welcome to bring one,
//    4 people -> choose two options

import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const root = process.cwd();
const T = (s, ...v) =>
  String.raw(s, ...v).replaceAll('§{', () => '${').replaceAll('¤', () => '`');

const find = (name, dirs) => {
  for (const d of dirs) {
    const p = path.join(root, d, name);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Could not find ${name}. Run this from the project root.`);
};

class Doc {
  constructor(file) {
    this.file = file;
    this.name = path.basename(file);
    this.raw = fs.readFileSync(file, 'utf8');
    this.crlf = this.raw.includes('\r\n');
    this.src = this.raw.replace(/\r\n/g, '\n');
  }
  replace(oldStr, newStr, count = 1) {
    const n = this.src.split(oldStr).length - 1;
    if (n !== count) throw new Error(`${this.name}: expected ${count} match(es) for:\n  ${oldStr.slice(0, 100)}\nfound ${n}.`);
    this.src = this.src.split(oldStr).join(newStr);
  }
  regex(re, newStr, count = 1) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    const n = (this.src.match(g) || []).length;
    if (n !== count) throw new Error(`${this.name}: expected ${count} match(es) for regex ${re}\nfound ${n}.`);
    this.src = this.src.replace(g, typeof newStr === 'function' ? newStr : () => newStr);
  }
  between(start, end, newStr, includeEnd = false) {
    const s = this.src.indexOf(start);
    if (s < 0 || this.src.indexOf(start, s + 1) >= 0) throw new Error(`${this.name}: start marker not found exactly once:\n  ${start}`);
    const e = this.src.indexOf(end, s + start.length);
    if (e < 0) throw new Error(`${this.name}: end marker not found:\n  ${end}`);
    this.src = this.src.slice(0, s) + newStr + this.src.slice(includeEnd ? e + end.length : e);
  }
  out() {
    return this.crlf ? this.src.replace(/\n/g, '\r\n') : this.src;
  }
}

const compDirs = ['src/components', 'src', 'components'];
const form = new Doc(find('RSVPForm.jsx', compDirs));
const menu = new Doc(find('PotluckMenu.jsx', compDirs));
const consts = new Doc(find('constants.js', ['src', 'src/constants', '.']));
const compDir = path.dirname(form.file);
const successFile = path.join(compDir, 'RSVPSuccess.jsx');

if (!form.src.includes('SuggestionChip')) {
  console.error('Run apply-potluck-fixes.mjs and apply-potluck-fixes-2.mjs first.');
  process.exit(1);
}
if (form.src.includes('RSVPSuccess') || fs.existsSync(successFile)) {
  console.log('These changes look already applied. Nothing to do.');
  process.exit(0);
}

// ───────────────────────── constants.js ─────────────────────────
// 3rd appetizer
consts.replace(
  "{ id: 'appetizer-2', name: 'Appetizer 2', serves: 8 },",
  "{ id: 'appetizer-2', name: 'Appetizer 2', serves: 8 },\n      { id: 'appetizer-3', name: 'Appetizer 3', serves: 8 },"
);
consts.regex(/\/\/ 2 slots available(\s+options: \[\s+\{ id: 'appetizer-1')/, (m, rest) => '// 3 slots available' + rest);

// Protein category (before Hot Veggie)
consts.regex(
  /  \{\n    id: 'hot-veggie',/,
  T`  {
    id: 'proteins',
    name: 'Protein',
    icon: '🍗',
    dishPlaceholder: 'e.g., Huli Huli Chicken',
    // 3 slots available - one each of fish, chicken and hot tofu.
    // "keywords" make the "Use this dish" button put an idea into the matching slot.
    options: [
      { id: 'protein-fish', name: 'Protein - Fish', serves: 12, keywords: ['fish', 'mahi', 'salmon', 'ahi', 'tuna', 'cod'], dishPlaceholder: 'e.g., Grilled Mahi-Mahi' },
      { id: 'protein-chicken', name: 'Protein - Chicken', serves: 15, keywords: ['chicken'], dishPlaceholder: 'e.g., Huli Huli Chicken' },
      { id: 'protein-tofu', name: 'Protein - Hot Tofu', serves: 10, keywords: ['tofu'], dishPlaceholder: 'e.g., Crispy Garlic Tofu' },
    ],
    recipeSuggestions: [
      'Grilled Mahi-Mahi with Macadamia Nut Crust',
      'Furikake-Crusted Ahi Steaks',
      'Miso-Glazed Salmon',
      'Baked Teriyaki Salmon',
      'Huli Huli Chicken (Grilled Pineapple Glaze)',
      'Shoyu Chicken',
      'Chicken Katsu with Tonkatsu Sauce',
      'Pineapple Teriyaki Chicken Skewers',
      'Vegetarian Lau Lau (Tofu, Sweet Potato, Taro Leaf)',
      'Crispy Garlic Tofu with Sweet Chili Sauce',
      'Teriyaki Tofu Stir-Fry',
      'Spicy Braised Tofu',
    ],
  },
  {
    id: 'hot-veggie',`
);

// Guidance text
consts.replace(
  'export const POTLUCK_NOTE =',
  T`export const DISH_GUIDANCE = "🍽️ Potluck guidance: ideally each couple brings a dish, and every guest over 18 is welcome to bring one too. If you're signing up as 4 people, please select two options.";

export const POTLUCK_NOTE =`
);

// RECIPE_DATA slot entries: appetizer-3 + proteins
const slotEntry = (id, name, desc, tags) => `  '${id}': {
    name: '${name}',
    providedBy: '',
    isHostProvided: false,
    description: '${desc}',
    recipes: [],
    variations: [],
    notes: HAWAIIAN_TIP,
    dietaryTags: ${tags},
  },
`;
consts.replace(
  `'hot-veggie-1': {`,
  slotEntry('appetizer-3', 'Appetizer 3', 'Bring your favorite appetizer or pupu to share! Recipe ideas available when you sign up.', '[]').trimStart() +
    slotEntry('protein-fish', 'Protein - Fish', 'Bring a hot fish dish to share! Recipe ideas available when you sign up.', '[]') +
    slotEntry('protein-chicken', 'Protein - Chicken', 'Bring a hot chicken dish to share! Recipe ideas available when you sign up.', '[]') +
    slotEntry('protein-tofu', 'Protein - Hot Tofu', 'Bring a hot tofu dish to share! Great for vegetarian guests. Recipe ideas available when you sign up.', "['vegetarian', 'vegan']") +
    `  'hot-veggie-1': {`
);

// ───────────────────────── RSVPSuccess.jsx (new page) ─────────────────────────
const successSrc = T`import { useEffect } from 'react';
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

  const title = attending ? ¤Mahalo, §{firstName}! You're on the list 🌺¤
    : maybe ? ¤Thanks, §{firstName} - we've marked you as a maybe¤
    : ¤We'll miss you, §{firstName}¤;

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
                : ¤A confirmation email is on its way to §{data.email}.¤}
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
`;

// ───────────────────────── RSVPForm.jsx ─────────────────────────
form.replace(`HAWAIIAN_TIP } from '../constants';`, `HAWAIIAN_TIP, DISH_GUIDANCE } from '../constants';`);
form.replace(`import { SuggestionChip } from './SuggestionChip';`, `import { SuggestionChip } from './SuggestionChip';\nimport { RSVPSuccess } from './RSVPSuccess';`);

// Guidance at the top of the RSVP page
form.replace(
  '<div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">',
  '<div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">\n          <div className="mb-4 p-4 rounded-xl bg-xmas-gold/10 border border-xmas-gold/30 text-sm text-xmas-cream">{DISH_GUIDANCE}</div>'
);

// Success -> its own page
form.regex(
  /\n  return \(\s*<>\s*<section id="rsvp"/,
  T`
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
      <section id="rsvp"`
);
// Email failure after a successful save is still a successful RSVP
form.replace(
  T`setSubmitResult({ success: false, message: 'RSVP saved but email notification failed. We\'ll still receive your response!' });`,
  `setSubmitResult({ success: true, message: 'RSVP submitted successfully!', data: rsvpData, emailFailed: true });\n      setRsvps(getAllRSVPs());`
);

// Re-check slot availability right before saving
form.replace(
  '// Include custom food in foodSelections if provided',
  T`// Re-check availability right before saving so two guests can't claim the same slot
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
      setSubmitResult({ success: false, message: ¤Sorry, §{claimed.map(c => c.name).join(', ')} was just claimed by another guest. It has been removed from your list - please pick another slot.¤ });
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Include custom food in foodSelections if provided`
);

// "TAKEN" / "YOURS" badge on step-3 cards
form.replace(
  '<div key={food.id} className="relative group">',
  T`<div key={food.id} className="relative group">
                              {isTaken && (
                                <div className="absolute top-2 right-2 z-10 max-w-[80%] bg-xmas-green text-xmas-night px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 shadow">
                                  <UsersIcon className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">TAKEN - {bringers[0].name}</span>
                                </div>
                              )}
                              {isSelected && !isTaken && (
                                <div className="absolute top-2 right-2 z-10 bg-xmas-gold text-xmas-night px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 shadow">
                                  <Check className="w-3 h-3" />
                                  <span>YOURS</span>
                                </div>
                              )}`
);

// "Use this dish": keyword slots (Protein) only take matching ideas
form.between(
  'const slot = category.options.find(opt =>',
  'if (slot) addFoodWithDish({ ...slot, category: category.id }, suggestion);',
  T`const free = category.options.filter(opt =>
                                    !formData.foodSelections.some(f => f.id === opt.id) &&
                                    !isHostProvided({ ...opt, category: category.id }) &&
                                    getFoodBringers({ ...opt, category: category.id }).length === 0
                                  );
                                  // Slots with keywords (Protein: fish / chicken / tofu) only take matching ideas
                                  const slot = free.find(opt => opt.keywords && opt.keywords.some(k => suggestion.toLowerCase().includes(k))) || free.find(opt => !opt.keywords);
                                  if (slot) addFoodWithDish({ ...slot, category: category.id }, suggestion);`,
  true
);
form.replace('placeholder={category.dishPlaceholder ||', 'placeholder={food.dishPlaceholder || category.dishPlaceholder ||');
form.replace('appetizer, hot veggie, starch, or dessert', 'appetizer, protein, hot veggie, starch, or dessert', 3);
form.replace(
  'const ideas = cat?.recipeSuggestions || [];',
  'const ideas = (cat?.recipeSuggestions || []).filter(s => !selectedFoodDetail.food.keywords || selectedFoodDetail.food.keywords.some(k => s.toLowerCase().includes(k)));'
);

// ───────────────────────── PotluckMenu.jsx ─────────────────────────
menu.replace(`HAWAIIAN_TIP } from '../constants';`, `HAWAIIAN_TIP, DISH_GUIDANCE } from '../constants';`);
menu.replace(
  '{/* Potluck Note */}',
  `{/* Dish guidance */}\n        <div className='mb-4 p-4 rounded-xl bg-xmas-gold/10 border border-xmas-gold/30 text-sm text-xmas-cream'>{DISH_GUIDANCE}</div>\n\n        {/* Potluck Note */}`
);
menu.replace(
  'const ideas = cat?.recipeSuggestions || [];',
  'const ideas = (cat?.recipeSuggestions || []).filter(s => !selectedFood.food.keywords || selectedFood.food.keywords.some(k => s.toLowerCase().includes(k)));'
);

// ───────────────────────── write ─────────────────────────
const docs = [form, menu, consts];
if (DRY) {
  console.log('Dry run OK: all edits matched in', docs.map(d => d.name).join(', '));
  process.exit(0);
}
const backupDir = path.join(root, '.potluck-backup-4');
fs.mkdirSync(backupDir, { recursive: true });
for (const d of docs) {
  fs.writeFileSync(path.join(backupDir, d.name), d.raw);
  fs.writeFileSync(d.file, d.out());
  console.log('patched', path.relative(root, d.file));
}
fs.writeFileSync(successFile, successSrc);
console.log('created', path.relative(root, successFile));
console.log('\nDone. Originals in .potluck-backup-4/. Restart `npm run dev` and test an RSVP end to end.');
