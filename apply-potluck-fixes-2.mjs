#!/usr/bin/env node
// Run AFTER apply-potluck-fixes.mjs, from the project root:  node apply-potluck-fixes-2.mjs
// Add --dry to check that every edit matches without writing anything.
//
//  - Menu + step 3: every "Recipe Ideas" suggestion is a card with working recipe links
//    (curated links from RECIPE_DATA where they exist, otherwise a "Find recipes" search link)
//  - Recipe ideas are always visible on the menu (no hidden toggle); step 3 cards get a "Use this dish" button
//  - "Add Your Own Dish" removed
//  - Hawaiian-style tip shown in every category (menu + step 3), in the note, and in slot details
//  - 2nd Hot Veggie slot added
//  - Guest names required (step 2)
//  - Dish-name placeholder is now per category (no more Ahi Poke Bowls for starches)
//  - Slot names made unique (Appetizer 1 / Appetizer 2...) -- they were identical, which made one signup mark BOTH slots taken
//  - Category emojis fixed (they were keyed to the old category names)
//  - Address unified to "1183 Hainstock Green SW, Edmonton, AB T6W3B6"; any "Honolulu, Hawaiʻi" text in src/ is replaced

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
  throw new Error(`Could not find ${name}. Run this from the project root (looked in ${dirs.join(', ')}).`);
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
  between(start, end, newStr) {
    const s = this.src.indexOf(start);
    if (s < 0 || this.src.indexOf(start, s + 1) >= 0) throw new Error(`${this.name}: start marker not found exactly once:\n  ${start}`);
    const e = this.src.indexOf(end, s + start.length);
    if (e < 0) throw new Error(`${this.name}: end marker not found:\n  ${end}`);
    this.src = this.src.slice(0, s) + newStr + this.src.slice(e);
  }
  out() {
    return this.crlf ? this.src.replace(/\n/g, '\r\n') : this.src;
  }
}

const compDirs = ['src/components', 'src', 'components'];
const form = new Doc(find('RSVPForm.jsx', compDirs));
const menu = new Doc(find('PotluckMenu.jsx', compDirs));
const storage = new Doc(find('storage.js', ['src/utils', 'utils', 'src']));
const consts = new Doc(find('constants.js', ['src', 'src/constants', '.']));
const compDir = path.dirname(form.file);
const chipFile = path.join(compDir, 'SuggestionChip.jsx');

if (!form.src.includes('addFoodWithDish')) {
  console.error('Run apply-potluck-fixes.mjs first (RSVPForm.jsx does not have its changes yet).');
  process.exit(1);
}
if (form.src.includes('SuggestionChip') || fs.existsSync(chipFile)) {
  console.log('These changes look already applied. Nothing to do.');
  process.exit(0);
}

// ───────────────────────── constants.js ─────────────────────────
consts.replace('address: "1183 Hainstock Green SW Edmonton, Alberta T6W3B6",', 'address: "1183 Hainstock Green SW, Edmonton, AB T6W3B6",');

// Unique slot names + per-category dish-name placeholder
consts.replace("icon: '🥟',", "icon: '🥟',\n    dishPlaceholder: 'e.g., Spam Musubi or Coconut Shrimp',");
consts.replace("icon: '🥦',", "icon: '🥦',\n    dishPlaceholder: 'e.g., Garlic Butter Green Beans',");
consts.replace("icon: '🍚',", "icon: '🍚',\n    dishPlaceholder: 'e.g., Garlic Butter Rice or Baked Taro',");
consts.replace("icon: '🍰',", "icon: '🍰',\n    dishPlaceholder: 'e.g., Haupia Squares or Butter Mochi',");

consts.replace("{ id: 'appetizer-1', name: 'Appetizer', serves: 8 },", "{ id: 'appetizer-1', name: 'Appetizer 1', serves: 8 },");
consts.replace("{ id: 'appetizer-2', name: 'Appetizer', serves: 8 },", "{ id: 'appetizer-2', name: 'Appetizer 2', serves: 8 },");
consts.replace('// 1 slot available', '// 2 slots available');
consts.replace(
  "{ id: 'hot-veggie-1', name: 'Hot Veggie', serves: 10 },",
  "{ id: 'hot-veggie-1', name: 'Hot Veggie 1', serves: 10 },\n      { id: 'hot-veggie-2', name: 'Hot Veggie 2', serves: 10 },"
);
consts.replace("{ id: 'starch-1', name: 'Starch', serves: 12 },", "{ id: 'starch-1', name: 'Starch 1', serves: 12 },");
consts.replace("{ id: 'starch-2', name: 'Starch', serves: 12 },", "{ id: 'starch-2', name: 'Starch 2', serves: 12 },");
consts.replace("{ id: 'dessert-1', name: 'Dessert', serves: 12 },", "{ id: 'dessert-1', name: 'Dessert 1', serves: 12 },");
consts.replace("{ id: 'dessert-2', name: 'Dessert', serves: 12 },", "{ id: 'dessert-2', name: 'Dessert 2', serves: 12 },");

for (const [id, base, n] of [['appetizer', 'Appetizer', 1], ['appetizer', 'Appetizer', 2], ['hot-veggie', 'Hot Veggie', 1], ['starch', 'Starch', 1], ['starch', 'Starch', 2], ['dessert', 'Dessert', 1], ['dessert', 'Dessert', 2]]) {
  consts.replace(`'${id}-${n}': {\n    name: '${base}',`, `'${id}-${n}': {\n    name: '${base} ${n}',`);
}

// Tip + note
consts.between(
  'export const POTLUCK_NOTE =',
  '// Recipe data for potluck items',
  T`export const HAWAIIAN_TIP = 'Make it Hawaiian-style - think kalua pig, poke, haupia, malasadas, poi, lomi salmon, or any tropical twist!';

export const POTLUCK_NOTE = '📝 Pick a slot and bring your own dish - recipes are optional!<br>🚫 No salads allowed, please.<br>💡 Open "Recipe Ideas" for inspiration and recipe links.<br>🌺 Tip: ' + HAWAIIAN_TIP;

`
);
consts.replace(`notes: 'Click "Recipe Ideas" in the RSVP form for Hawaiian-inspired suggestions.',`, 'notes: HAWAIIAN_TIP,', 7);

// Second hot veggie slot
consts.replace(
  `'starch-1': {`,
  T`'hot-veggie-2': {
    name: 'Hot Veggie 2',
    providedBy: '',
    isHostProvided: false,
    description: 'Bring a hot vegetable dish to share! Recipe ideas available when you sign up.',
    recipes: [],
    variations: [],
    notes: HAWAIIAN_TIP,
    dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
  },
  'starch-1': {`
);

// Suggestion -> recipe links lookup
if (!consts.src.endsWith('\n')) consts.src += '\n';
consts.src += T`
// ---- Recipe lookup for the "Recipe Ideas" cards ----
// Reuses the curated links in RECIPE_DATA when a suggestion matches a dish by name;
// otherwise falls back to a recipe web search so every idea has a working link.
const normalizeDishName = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export const getSuggestionRecipes = (suggestion) => {
  const key = normalizeDishName(suggestion);
  const entry = Object.values(RECIPE_DATA).find(r => r.recipes && r.recipes.length > 0 && normalizeDishName(r.name) === key);
  return {
    recipes: entry ? entry.recipes : [],
    searchUrl: ¤https://www.google.com/search?q=§{encodeURIComponent(suggestion + ' recipe')}¤,
  };
};
`;

// ───────────────────────── SuggestionChip.jsx (new) ─────────────────────────
const chipSrc = T`import { ExternalLink } from 'lucide-react';
import { getSuggestionRecipes } from '../constants';

// One recipe idea: dish name + recipe links (+ optional "Use this dish" button)
export const SuggestionChip = ({ suggestion, onUse }) => {
  const { recipes, searchUrl } = getSuggestionRecipes(suggestion);
  const linkClass = 'inline-flex items-center space-x-1 text-xs text-xmas-gold/90 hover:text-xmas-gold hover:underline';
  return (
    <div className="px-3 py-2 bg-xmas-darkred/50 border border-xmas-gold/30 rounded-lg text-xs text-xmas-cream max-w-full">
      <p className="font-medium break-words">{suggestion}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        {recipes.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <ExternalLink className="w-3 h-3" /><span>{r.name}</span>
          </a>
        ))}
        {recipes.length === 0 && (
          <a href={searchUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <ExternalLink className="w-3 h-3" /><span>Find recipes</span>
          </a>
        )}
        {onUse && (
          <button type="button" onClick={onUse} className="px-2 py-0.5 rounded-full border border-xmas-gold/50 text-xmas-gold hover:bg-xmas-gold/20 transition-colors">
            Use this dish
          </button>
        )}
      </div>
    </div>
  );
};
`;

// ───────────────────────── PotluckMenu.jsx ─────────────────────────
menu.replace(`POTLUCK_NOTE } from '../constants';`, `POTLUCK_NOTE, HAWAIIAN_TIP } from '../constants';`);
menu.replace(`import { ChristmasBackground } from './ChristmasBackground';`, `import { ChristmasBackground } from './ChristmasBackground';\nimport { SuggestionChip } from './SuggestionChip';`);

// Remove the hidden "Recipe Ideas" toggle button; ideas are always visible
menu.regex(/\{category\.recipeSuggestions && category\.recipeSuggestions\.length > 0 && \(\s*<button[\s\S]*?<\/button>\s*\)\}/, '');
menu.replace('{showRecipeIdeas === category.id && category.recipeSuggestions && (', '{category.recipeSuggestions && (');
menu.replace('Click a suggestion for inspiration, or bring your own dish:', 'Recipe ideas - tap a link to open the recipe in a new tab:');
menu.regex(/<span\s+key=\{idx\}[\s\S]*?\{suggestion\}\s*<\/span>/, '<SuggestionChip key={idx} suggestion={suggestion} />');

menu.replace(
  `<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>`,
  `<p className='text-xs text-xmas-gold/80'>💡 Tip: {HAWAIIAN_TIP}</p>\n                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>`
);

// Category emoji (was keyed to old category names)
menu.regex(/\{category === 'Pūpū[\s\S]*?'🍹'\}/, '{FOOD_CATEGORIES.find(c => c.name === category)?.icon}');
menu.regex(/\{selectedFood\.category === 'Pūpū[\s\S]*?'🍹'\}/, '{FOOD_CATEGORIES.find(c => c.name === selectedFood.category)?.icon}');

// Modal: recipe ideas with links for slot dishes
menu.replace(
  '{/* Notes & Bringers */}',
  T`{(() => {
                const cat = FOOD_CATEGORIES.find(c => c.name === selectedFood.category);
                const ideas = cat?.recipeSuggestions || [];
                return ideas.length > 0 && !(selectedFood.recipeData?.recipes?.length > 0) ? (
                  <div className='mb-6 bg-xmas-night/50 border border-xmas-darkred/30 rounded-xl p-4'>
                    <h3 className='flex items-center space-x-2 text-xmas-gold mb-3'>
                      <BookOpen className='w-5 h-5' />
                      <span className='font-display text-lg'>Recipe ideas</span>
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {ideas.map((s, i) => <SuggestionChip key={i} suggestion={s} />)}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Notes & Bringers */}`
);

// ───────────────────────── RSVPForm.jsx ─────────────────────────
form.replace(`POTLUCK_NOTE } from '../constants';`, `POTLUCK_NOTE, HAWAIIAN_TIP } from '../constants';`);
form.replace(`import { ChristmasBackground } from './ChristmasBackground';`, `import { ChristmasBackground } from './ChristmasBackground';\nimport { SuggestionChip } from './SuggestionChip';`);

// Remove "Add Your Own Dish"
form.regex(/\{\/\* Custom Food Option \*\/\}[\s\S]*?for others to see\.\s*<\/p>\s*<\/div>\s*/, '');

// Guest names required
form.replace(
  `if (formData.attendance === 'yes' && formData.partySize < 1) newErrors.partySize = 'Party size required';`,
  T`if (formData.attendance === 'yes' && formData.partySize < 1) newErrors.partySize = 'Party size required';
      if (formData.attendance !== 'no' && formData.partySize > 1) {
        const missing = Array.from({ length: formData.partySize - 1 }, (_, i) => i).some(i => !((formData.partyNames || [])[i] || '').trim());
        if (missing) newErrors.partyNames = 'Please enter a name for every guest in your party.';
      }`
);
form.replace('const handlePartyName = (index, value) => {', `const handlePartyName = (index, value) => {\n    setErrors(prev => ({ ...prev, partyNames: '' }));`);
form.replace(
  '<label className="label">Names of your guests (optional)</label>',
  '<label className="label">Names of your guests *</label>\n                        {errors.partyNames && <p className="mb-2 text-sm text-red-400">{errors.partyNames}</p>}'
);
form.regex(
  /(key=\{i\}\s*type="text"\s*)className="input-field"/,
  (m, pre) => T`${pre}className={¤input-field §{errors.partyNames && !((formData.partyNames || [])[i] || '').trim() ? 'border-red-500 focus:ring-red-500' : ''}¤}`
);

// Slot wording (categories are now Appetizer / Hot Veggie / Starch / Dessert)
form.replace('appetizer, main, side, or dessert', 'appetizer, hot veggie, starch, or dessert', 3);
form.replace("; drinks don't count)", ')');

// Per-category dish-name placeholder
form.replace('placeholder="e.g., Ahi Poke Bowls"', `placeholder={category.dishPlaceholder || 'Name your dish'}`);

// Tip in every category
form.replace(
  '<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">',
  '<p className="mb-3 text-xs text-xmas-gold/80">💡 Tip: {HAWAIIAN_TIP}</p>\n                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">'
);

// Recipe Ideas dropdown: cards with links + "Use this dish"
form.replace('Click a suggestion to use it, or type your own:', 'Tap "Use this dish" to fill a free slot, or open a recipe link. You can also type your own dish name on any slot:');
form.regex(
  /<button\s+key=\{idx\}[\s\S]*?\{suggestion\}\s*<\/button>/,
  T`<SuggestionChip
                                key={idx}
                                suggestion={suggestion}
                                onUse={() => {
                                  const slot = category.options.find(opt =>
                                    !formData.foodSelections.some(f => f.id === opt.id) &&
                                    !isHostProvided({ ...opt, category: category.id }) &&
                                    getFoodBringers({ ...opt, category: category.id }).length === 0
                                  );
                                  if (slot) addFoodWithDish({ ...slot, category: category.id }, suggestion);
                                }}
                              />`
);

// Category emoji + recipe ideas in the details modal
form.regex(/\{selectedFoodDetail\.category === 'Pūpū[\s\S]*?'🍹'\}/, '{FOOD_CATEGORIES.find(c => c.name === selectedFoodDetail.category)?.icon}');
form.replace(
  '{selectedFoodDetail.bringers.length > 0 && (',
  T`{(() => {
            const cat = FOOD_CATEGORIES.find(c => c.name === selectedFoodDetail.category);
            const ideas = cat?.recipeSuggestions || [];
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
          {selectedFoodDetail.bringers.length > 0 && (`
);

// ───────────────────────── storage.js ─────────────────────────
storage.replace(
  `const validCategoryIds = ['appetizers', 'mains', 'sides', 'desserts', 'drinks'];`,
  'const validCategoryIds = FOOD_CATEGORIES.map(c => c.id);'
);
// Older sheet rows saved just "Appetizer" etc. -> map to that category's first slot
storage.replace(
  'const found = cat.options.find(opt => opt.name === name);',
  'const found = cat.options.find(opt => opt.name === name) || (cat.name === name ? cat.options[0] : null);'
);
storage.replace('isKnownFood = true;', 'isKnownFood = true;\n            name = found.name;');

// ───────────────────────── "Honolulu" sweep ─────────────────────────
const HOME = '1183 Hainstock Green SW, Edmonton, AB';
const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(jsx?|tsx?|html|css|md)$/i.test(e.name)) out.push(p);
  }
  return out;
};
const sweepFiles = [...walk(path.join(root, 'src')), ...['index.html', 'public/index.html'].map(f => path.join(root, f)).filter(fs.existsSync)];
const honolulu = [];
const titleFiles = [];
for (const f of sweepFiles) {
  const txt = fs.readFileSync(f, 'utf8');
  if (/聖誕快樂/.test(txt)) titleFiles.push(path.relative(root, f));
  const re = /Honolulu\s*,\s*(Hawai[ʻ'’‘`]?i|HI)(\s*,?\s*(USA|US))?/gi;
  if (re.test(txt)) honolulu.push({ f, txt: txt.replace(re, HOME) });
}

// ───────────────────────── write ─────────────────────────
const docs = [form, menu, storage, consts];
if (DRY) {
  console.log('Dry run OK: all edits matched in', docs.map(d => d.name).join(', '));
  console.log('Honolulu text found in:', honolulu.map(h => path.relative(root, h.f)).join(', ') || '(none in src/)');
  console.log('Title "聖誕快樂" found in:', titleFiles.join(', ') || '(not found)');
  process.exit(0);
}
const backupDir = path.join(root, '.potluck-backup-2');
fs.mkdirSync(backupDir, { recursive: true });
for (const d of docs) {
  fs.writeFileSync(path.join(backupDir, d.name), d.raw);
  fs.writeFileSync(d.file, d.out());
  console.log('patched', path.relative(root, d.file));
}
fs.writeFileSync(chipFile, chipSrc);
console.log('created', path.relative(root, chipFile));
for (const h of honolulu) {
  fs.writeFileSync(path.join(backupDir, 'honolulu-' + path.basename(h.f)), fs.readFileSync(h.f));
  fs.writeFileSync(h.f, h.txt);
  console.log('replaced Honolulu in', path.relative(root, h.f));
}
const leftovers = sweepFiles.filter(f => /Honolulu/i.test(fs.readFileSync(f, 'utf8'))).map(f => path.relative(root, f));
if (leftovers.length) console.log('\nStill mentions "Honolulu" (different wording, fix by hand):', leftovers.join(', '));
else if (!honolulu.length) console.log('\nNo "Honolulu" text found in src/ -- it may come from an image, public/ file, or the deployed cache.');
console.log('\nHero title ("聖誕快樂") lives in:', titleFiles.join(', ') || '(not found in src/)');
console.log('Send me that file and I will shrink/lower the title so the pig shows.');
console.log('\nDone. Originals saved in .potluck-backup-2/. Restart `npm run dev` and test.');
