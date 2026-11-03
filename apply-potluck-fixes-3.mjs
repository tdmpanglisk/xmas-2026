#!/usr/bin/env node
// Run from the project root:  node apply-potluck-fixes-3.mjs   (add --dry to only check)
//
//  - Hero: title block is smaller and sits lower, the bottom gradient is lighter, the pig emoji row and
//    "Hosted at" badge are smaller, so the pig photo shows
//  - Hero: Location tile "Honolulu, Hawai'i" -> 1183 Hainstock Green SW, Edmonton, AB
//  - Hero: countdown targeted December 20 -- changed to December 25, 2026 5:00 PM (matches EVENT_CONFIG)
//  - Any other "Honolulu, Hawai'i" text in src/ (including the &apos; spelling) is replaced too

import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const root = process.cwd();
const HOME = '1183 Hainstock Green SW, Edmonton, AB';

const find = (name, dirs) => {
  for (const d of dirs) {
    const p = path.join(root, d, name);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Could not find ${name}. Run this from the project root.`);
};

const heroFile = find('Hero.jsx', ['src/components', 'src', 'components']);
const raw = fs.readFileSync(heroFile, 'utf8');
const crlf = raw.includes('\r\n');
let src = raw.replace(/\r\n/g, '\n');

const replace = (oldStr, newStr) => {
  const n = src.split(oldStr).length - 1;
  if (n !== 1) throw new Error(`Hero.jsx: expected 1 match, found ${n} for:\n  ${oldStr.slice(0, 100)}\n(Already applied, or the file changed.)`);
  src = src.split(oldStr).join(newStr);
};

// Title: smaller + lower so the pig is visible
replace(
  'bg-gradient-to-t from-xmas-night/90 via-xmas-night/40 to-xmas-night/10',
  'bg-gradient-to-t from-xmas-night/80 via-transparent to-transparent'
);
replace('flex items-end justify-center p-8 sm:p-12', 'flex items-end justify-center p-3 pb-5 sm:p-4 sm:pb-6');
replace('flex items-center justify-center space-x-3 mb-4', 'flex items-center justify-center space-x-3 mb-1');
replace('text-2xl sm:text-3xl animate-pulse-slow', 'text-base sm:text-lg animate-pulse-slow');
replace(
  'font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-xmas-cream mb-2 leading-tight text-balance',
  'font-display text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-xmas-cream mb-1.5 leading-tight text-balance drop-shadow-lg'
);
replace(
  'px-3 py-1.5 rounded-full text-xmas-gold font-semibold text-xs sm:text-sm',
  'px-2.5 py-0.5 rounded-full text-xmas-gold font-semibold text-[10px] sm:text-xs'
);

// Location + countdown
replace('value="Honolulu, Hawai&apos;i"', `value="${HOME}"`);
replace('new Date("December 20, 2026 17:00:00")', 'new Date("December 25, 2026 17:00:00")');

// Any other Honolulu text elsewhere in src/
const HONOLULU = /Honolulu\s*,\s*(Hawai(?:[ʻ'’‘`]|&apos;|&#39;|&rsquo;)?i|HI)(\s*,?\s*(USA|US))?/gi;
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
const others = [...walk(path.join(root, 'src')), ...['index.html', 'public/index.html'].map(f => path.join(root, f)).filter(fs.existsSync)]
  .filter(f => path.resolve(f) !== path.resolve(heroFile));
const fixes = [];
for (const f of others) {
  const t = fs.readFileSync(f, 'utf8');
  if (HONOLULU.test(t)) fixes.push({ f, t: t.replace(HONOLULU, () => HOME), orig: t });
  HONOLULU.lastIndex = 0;
}

if (DRY) {
  console.log('Dry run OK: Hero.jsx edits matched. Other files with Honolulu:', fixes.map(x => path.relative(root, x.f)).join(', ') || '(none)');
  process.exit(0);
}

const backupDir = path.join(root, '.potluck-backup-3');
fs.mkdirSync(backupDir, { recursive: true });
fs.writeFileSync(path.join(backupDir, 'Hero.jsx'), raw);
fs.writeFileSync(heroFile, crlf ? src.replace(/\n/g, '\r\n') : src);
console.log('patched', path.relative(root, heroFile));
for (const x of fixes) {
  fs.writeFileSync(path.join(backupDir, 'orig-' + path.basename(x.f)), x.orig);
  fs.writeFileSync(x.f, x.t);
  console.log('replaced Honolulu in', path.relative(root, x.f));
}
const left = others.filter(f => /Honolulu/i.test(fs.readFileSync(f, 'utf8'))).map(f => path.relative(root, f));
if (left.length) console.log('\nStill mentions "Honolulu" (different wording, fix by hand):', left.join(', '));
console.log('\nDone. Originals in .potluck-backup-3/. Check the hero at phone width too -- if the title still covers the pig, tell me and I will move it outside the photo.');
