// apply-rsvp-layout.mjs
// Usage (from project root): node apply-rsvp-layout.mjs [path/to/RSVPForm.jsx]
// Makes the form wider, shrinks the progress bar and headings, and shows more dishes per row.
// Backs up to <file>.layout.bak first. Safe to run twice.
import fs from "node:fs";
import path from "node:path";

// [old, new, expectedCount]
const EDITS = [
  // page padding + width
  ['<section id="rsvp" className="relative min-h-screen pt-16 pb-20">',
   '<section id="rsvp" className="relative min-h-screen pt-12 pb-12">', 1],
  ['relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12',
   'relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6', 1],

  // smaller progress bar
  ['<div className="mb-10">', '<div className="mb-4">', 1],
  ['<div className="flex items-center justify-center mb-6">',
   '<div className="flex items-center justify-center mb-2">', 1],
  ['w-10 h-10 rounded-full flex items-center justify-center font-semibold',
   'w-7 h-7 rounded-full flex items-center justify-center font-semibold', 1],
  ['{step > s.number ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}',
   '{step > s.number ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}', 1],
  ['w-20 h-2 mx-2', 'w-12 h-1 mx-2', 1],
  ['<div className="text-center text-xmas-cream/70">Step',
   '<div className="text-center text-sm text-xmas-cream/70">Step', 1],

  // smaller headings
  ['<h2 className="section-title">',
   '<h2 className="section-title !text-2xl md:!text-3xl">', 3],

  // tighter form spacing
  ['className="card space-y-8" noValidate', 'className="card space-y-5" noValidate', 1],

  // more dishes visible: 3 per row on large screens, shorter images
  ['<div className="grid sm:grid-cols-2 gap-3">',
   '<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">', 1],
  ['relative h-32 md:h-40', 'relative h-24 md:h-28', 1],
];

const candidates = [
  process.argv[2],
  "src/components/RSVPForm.jsx",
  "src/components/RSVPForm.js",
  "src/components/RSVPForm.tsx",
  "components/RSVPForm.jsx",
].filter(Boolean);

function findFile(dir, depth = 0) {
  if (depth > 5) return null;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { const r = findFile(p, depth + 1); if (r) return r; }
    else if (/^RSVPForm\.(jsx|js|tsx)$/.test(e.name)) return p;
  }
  return null;
}

const target = candidates.find((p) => fs.existsSync(p)) || findFile(process.cwd());
if (!target) {
  console.error("Could not find RSVPForm. Pass the path: node apply-rsvp-layout.mjs src/components/RSVPForm.jsx");
  process.exit(1);
}

let src = fs.readFileSync(target, "utf8");
const count = (s, needle) => s.split(needle).length - 1;
let applied = 0, skipped = 0, failed = 0;

for (const [oldStr, newStr, expected] of EDITS) {
  const n = count(src, oldStr);
  if (n === expected) {
    src = src.split(oldStr).join(newStr);
    applied++;
  } else if (n === 0 && count(src, newStr) >= expected) {
    skipped++; // already applied
  } else {
    failed++;
    console.warn(`! Skipped (found ${n}, expected ${expected}): ${oldStr.slice(0, 70)}`);
  }
}

if (applied > 0) {
  fs.copyFileSync(target, target + ".layout.bak");
  fs.writeFileSync(target, src);
}
console.log(`${target}: ${applied} applied, ${skipped} already done, ${failed} not found`);
if (applied > 0) console.log(`Backup: ${target}.layout.bak`);
