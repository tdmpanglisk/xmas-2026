#!/usr/bin/env node
// Drop this in the project root, then run:  node apply-potluck-fixes.mjs
// Add --dry to check that every edit matches without writing anything.
//
// What it does (no Google Sheet column changes, no Apps Script redeploy needed):
//  - RSVPForm: fixes the missing BookOpen import (crashes step 3), shows recipe links on cards,
//    requires a dish name per selected item, shows "Dish (Name)" for taken items, shows other guests'
//    custom dishes, shows party guests on the success screen
//  - PotluckMenu: dish names + recipe links visible right on each card
//  - storage.js: dish names survive Google Sheets sync (packed into the Food Selections column),
//    custom dishes keep isCustom after sync, duplicate-email rows collapse (newest wins), exports include dish names
//  - emailService.js: dish names in guest/host emails, host email date fixed to Dec 25
//  - AdminView: dish names in the table and expanded row

import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const root = process.cwd();

// Snippet helper: write § instead of $ before { and ¤ instead of a backtick, so snippets stay readable.
const T = (s, ...v) =>
  String.raw(s, ...v).replaceAll('§{', () => '${').replaceAll('¤', () => '`');

const find = (name, dirs) => {
  for (const d of dirs) {
    const p = path.join(root, d, name);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Could not find ${name}. Run this from the project root (looked in ${dirs.join(', ')}).`);
};

class Doc {
  constructor(file) {
    this.file = file;
    this.name = path.basename(file);
    const raw = fs.readFileSync(file, 'utf8');
    this.raw = raw;
    this.crlf = raw.includes('\r\n');
    this.src = raw.replace(/\r\n/g, '\n');
  }
  replace(oldStr, newStr, count = 1) {
    const n = this.src.split(oldStr).length - 1;
    if (n !== count) {
      throw new Error(`${this.name}: expected ${count} match(es) for:\n  ${oldStr.slice(0, 90)}\nfound ${n}. (Already applied, or the file changed.)`);
    }
    this.src = this.src.split(oldStr).join(newStr);
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

const dirs = {
  comp: ['src/components', 'src', 'components'],
  util: ['src/utils', 'utils', 'src'],
};
const form = new Doc(find('RSVPForm.jsx', dirs.comp));
const menu = new Doc(find('PotluckMenu.jsx', dirs.comp));
const admin = new Doc(find('AdminView.jsx', dirs.comp));
const storage = new Doc(find('storage.js', dirs.util));
const email = new Doc(find('emailService.js', dirs.util));

if (form.src.includes('addFoodWithDish')) {
  console.log('RSVPForm.jsx already has these changes. Nothing to do.');
  process.exit(0);
}

// ───────────────────────── RSVPForm.jsx ─────────────────────────
form.replace(`Shield, Plus } from 'lucide-react';`, `Shield, Plus, BookOpen } from 'lucide-react';`);

form.between(
  'const getFoodBringers = (food) => {',
  'const isHostProvided = (food) => {',
  T`const getFoodBringers = (food) => {
    const me = (formData.email || '').trim().toLowerCase();
    const bringers = [];
    rsvps.filter(r => r.attendance === 'yes').forEach(rsvp => {
      // Your own earlier RSVP (same email) shouldn't lock you out of your dishes when editing
      if (me && (rsvp.email || '').toLowerCase() === me) return;
      (rsvp.foodSelections || []).forEach(f => {
        // Primary match by food ID, fallback by name
        if ((food.id && f.id === food.id) || f.name === food.name) {
          bringers.push({ name: rsvp.name, dishName: f.dishName || '' });
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

  `
);

// Require a dish name for every selected item
form.replace(
  'setErrors(newErrors);',
  T`if (currentStep === 3 && formData.attendance === 'yes' && !newErrors.food) {
      const unnamed = formData.foodSelections.find(f => !(f.dishName || '').trim());
      if (unnamed) newErrors.dishName = ¤Please add your dish name for "§{unnamed.name}".¤;
    }
    setErrors(newErrors);`
);

form.replace(
  'const updateDishName = (foodId, dishName) => {',
  T`const addFoodWithDish = (food, dishName) => {
    setFormData(prev => prev.foodSelections.some(f => f.id === food.id)
      ? prev
      : { ...prev, foodSelections: [...prev.foodSelections, { ...food, dishName }] });
  };

  const updateDishName = (foodId, dishName) => {
    setErrors(prev => ({ ...prev, dishName: '' }));`
);

// Recipe-idea chips: pick a free slot (not taken / host provided) and fill the dish name in one update
form.between(
  'const slot = category.options.find(opt =>',
  'setTimeout(() => updateDishName(slot.id, suggestion), 0);',
  T`const slot = category.options.find(opt =>
                                    !formData.foodSelections.some(f => f.id === opt.id) &&
                                    !isHostProvided({ ...opt, category: category.id }) &&
                                    getFoodBringers({ ...opt, category: category.id }).length === 0
                                  );
                                  if (slot) {
                                    addFoodWithDish({ ...slot, category: category.id }, suggestion);`,
  true
);

form.replace('{category.options.map((food) => {', '{[...category.options, ...getCustomFoods(category.id)].map((food) => {');

form.replace(
  `Bringing: {bringers.join(', ')}`,
  T`Bringing: {bringers.map(b => (b.dishName ? ¤§{b.dishName} (§{b.name})¤ : b.name)).join(', ')}`
);

// Recipe links directly on each step-3 card
form.replace(
  'Serves ~{foodWithCategory.serves} people</p>',
  T`Serves ~{foodWithCategory.serves} people</p>
                                      {recipeData?.recipes?.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                          {recipeData.recipes.slice(0, 2).map((r, i) => (
                                            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center space-x-1 text-xs text-xmas-cream/70 hover:text-xmas-gold hover:underline">
                                              <ExternalLink className="w-3 h-3" /><span>{r.name}</span>
                                            </a>
                                          ))}
                                        </div>
                                      )}`
);

// A <label> nested inside the card <label> can toggle the checkbox; use a span and mark it required
form.replace(
  '<label className="block text-xs text-xmas-cream/60 mb-1">Your Dish Name:</label>',
  '<span className="block text-xs text-xmas-cream/60 mb-1">Your Dish Name (required):</span>'
);

// Modal: "Bringing this dish" shows dish name + person
form.replace('selectedFoodDetail.bringers.map((name, i) => (', 'selectedFoodDetail.bringers.map((b, i) => (');
form.replace(
  'text-sm font-medium">{name}</span>',
  'text-sm font-medium">{b.dishName ? <>{b.dishName} <span className="text-xmas-cream/70">- {b.name}</span></> : b.name}</span>'
);

// Dish-name error in the "Required" box
form.replace(`errors.food && short ? 'bg-red-900/30`, `(errors.food && short) || errors.dishName ? 'bg-red-900/30`);
form.replace(
  '{errors.food && short && <p className="mt-1">{errors.food}</p>}',
  '{errors.food && short && <p className="mt-1">{errors.food}</p>}\n                        {errors.dishName && <p className="mt-1">{errors.dishName}</p>}'
);

// Party guests on the success screen
form.replace(
  '<span className="text-green-400">Party Size:</span> {submitResult.data.partySize}</div>',
  T`<span className="text-green-400">Party Size:</span> {submitResult.data.partySize}</div>
                      {(submitResult.data.partyNames || []).length > 0 && (
                        <div className="sm:col-span-2"><span className="text-green-400">Guests:</span> {submitResult.data.partyNames.join(', ')}</div>
                      )}`
);

// ───────────────────────── PotluckMenu.jsx ─────────────────────────
menu.between(
  'const getFoodBringers = (food) => {',
  'const isHostProvided = (food) => {',
  T`const getFoodBringers = (food) => {
    const bringers = [];
    rsvps.filter(r => r.attendance === 'yes').forEach(rsvp => {
      (rsvp.foodSelections || []).forEach(f => {
        // Primary match by food ID, fallback by name
        if ((food.id && f.id === food.id) || f.name === food.name) {
          bringers.push({ name: rsvp.name, dishName: f.dishName || '' });
        }
      });
    });
    return bringers;
  };

  `
);
menu.replace('rsvp.foodSelections.forEach(f => {', '(rsvp.foodSelections || []).forEach(f => {');

menu.replace(
  `<div className='flex items-center justify-between text-sm px-4 pb-4'>`,
  T`{recipeData?.recipes?.length > 0 && (
        <div className='px-4 pb-2 flex flex-wrap gap-x-3 gap-y-1' onClick={e => e.stopPropagation()}>
          {recipeData.recipes.slice(0, 2).map((r, i) => (
            <a key={i} href={r.url} target='_blank' rel='noopener noreferrer' className='inline-flex items-center space-x-1 text-xs text-xmas-cream/70 hover:text-xmas-gold hover:underline'>
              <ExternalLink className='w-3 h-3' /><span>{r.name}</span>
            </a>
          ))}
        </div>
      )}
      {bringers.length > 0 && (
        <div className='px-4 pb-2 space-y-0.5'>
          {bringers.map((b, i) => (
            <p key={i} className='text-xs text-xmas-green break-words'>
              {b.dishName ? <strong>{b.dishName}</strong> : 'Signed up'} <span className='text-xmas-cream/60'>by {b.name}</span>
            </p>
          ))}
        </div>
      )}
      <div className='flex items-center justify-between text-sm px-4 pb-4'>`
);

// ───────────────────────── storage.js ─────────────────────────
storage.replace(
  `const STORAGE_KEY = 'xmas2026_rsvps';`,
  T`const STORAGE_KEY = 'xmas2026_rsvps';

// Dish names ride inside the existing "Food Selections" sheet column, e.g.
// "Kalua Pig :: Smoky Kalua (serves 10) [mains]" -> no new sheet columns, no Apps Script change.
const DISH_SEP = ' :: ';
const cleanDishName = (n) => String(n || '').replace(/[()\[\]{},]/g, ' ').replace(/::/g, ' ').replace(/\s+/g, ' ').trim();
const packFoodSelections = (list) => (list || []).map(f => {
  const dish = cleanDishName(f.dishName);
  return dish ? { ...f, name: ¤§{f.name}§{DISH_SEP}§{dish}¤ } : f;
});`
);
storage.replace(
  'body: JSON.stringify({ ...rsvpData, specialRequests: packSpecialRequests(rsvpData) }),',
  'body: JSON.stringify({ ...rsvpData, foodSelections: packFoodSelections(rsvpData.foodSelections), specialRequests: packSpecialRequests(rsvpData) }),'
);
storage.replace(
  '// Find the food ID by matching name against FOOD_CATEGORIES',
  T`// Split "Food Name :: Dish Name" back apart
        let dishName = '';
        const sepIdx = name.indexOf(DISH_SEP);
        if (sepIdx >= 0) {
          dishName = name.slice(sepIdx + DISH_SEP.length).trim();
          name = name.slice(0, sepIdx).trim();
        }
        let isKnownFood = false;
        // Find the food ID by matching name against FOOD_CATEGORIES`
);
storage.replace('foodId = found.id;', 'foodId = found.id;\n            isKnownFood = true;');
storage.replace(
  'return { name, serves, category, id: foodId };',
  'return { name, serves, category, id: foodId, ...(dishName ? { dishName } : {}), ...(isKnownFood ? {} : { isCustom: true }) };'
);
// Sheet appends a new row per submit, so duplicate emails collapse to the newest row
storage.replace('const merged = [...remoteRSVPs];', 'const merged = [...remoteMap.values(), ...remoteRSVPs.filter(r => !r.email)];');
storage.replace(
  T`§{f.name} (§{f.category})`,
  T`§{f.name}§{f.dishName ? ' - ' + f.dishName : ''} (§{f.category})`,
  2
);

// ───────────────────────── emailService.js ─────────────────────────
email.replace(
  T`§{f.name} (serves §{f.serves})`,
  T`§{f.name}§{f.dishName ? ' - ' + f.dishName : ''} (serves §{f.serves})`,
  2
);
email.replace(`event_date: 'December 20, 2026',`, `event_date: 'December 25, 2026',`);

// ───────────────────────── AdminView.jsx ─────────────────────────
admin.replace('rsvp.foodSelections.map(f=>f.name).join(", ")', 'rsvp.foodSelections.map(f=>f.name+(f.dishName?" - "+f.dishName:"")).join(", ")');
admin.replace('map(f=>f.name+" (serves "', 'map(f=>f.name+(f.dishName?" - "+f.dishName:"")+" (serves "');

// ───────────────────────── write ─────────────────────────
const docs = [form, menu, admin, storage, email];
if (DRY) {
  console.log('Dry run OK: all edits matched in', docs.map(d => d.name).join(', '));
  process.exit(0);
}
const backupDir = path.join(root, '.potluck-backup');
fs.mkdirSync(backupDir, { recursive: true });
for (const d of docs) {
  fs.writeFileSync(path.join(backupDir, d.name), d.raw);
  fs.writeFileSync(d.file, d.out());
  console.log('patched', path.relative(root, d.file));
}
console.log('\nDone. Originals saved in .potluck-backup/. Restart `npm run dev` and test the RSVP flow.');
