// apply-admin-fix.mjs
// Usage (from project root): node apply-admin-fix.mjs [path/to/AdminView.jsx]
// Fixes the blank Admin view. Backs up to <file>.admin.bak first. Safe to run twice.
import fs from "node:fs";
import path from "node:path";

const candidates = [
  process.argv[2],
  "src/components/AdminView.jsx",
  "src/components/AdminView.js",
  "src/components/AdminView.tsx",
  "components/AdminView.jsx",
].filter(Boolean);

function findFile(dir, depth = 0) {
  if (depth > 5) return null;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { const r = findFile(p, depth + 1); if (r) return r; }
    else if (/^AdminView\.(jsx|js|tsx)$/.test(e.name)) return p;
  }
  return null;
}

const target = candidates.find((p) => fs.existsSync(p)) || findFile(process.cwd());
if (!target) {
  console.error("Could not find AdminView. Pass the path: node apply-admin-fix.mjs src/components/AdminView.jsx");
  process.exit(1);
}

let src = fs.readFileSync(target, "utf8");
const original = src;
const log = [];

// 1. Missing `Phone` import (used in the table; crashes the page as soon as an RSVP has a phone number)
if (!/\bPhone\b[^;\n]*from 'lucide-react'/.test(src) && !/\bPhone,/.test(src.split("\n").find((l) => l.includes("lucide-react")) || "")) {
  if (src.includes("Mail, CheckCircle")) {
    src = src.replace("Mail, CheckCircle", "Mail, Phone, CheckCircle");
    log.push("added missing Phone import");
  } else log.push("! could not find the lucide-react import to add Phone");
}

// 2. Normalize RSVP records so missing/odd fields (e.g. from Google Sheets) can't crash the table
if (!src.includes("normalizeRsvp")) {
  const helper = `const asArray = (v) => (Array.isArray(v) ? v : []);
const normalizeRsvp = (r) => ({
  ...r,
  name: r.name || '',
  email: r.email || '',
  phone: r.phone || '',
  partySize: Number(r.partySize) || 1,
  foodSelections: asArray(r.foodSelections),
  dietaryRestrictions: asArray(r.dietaryRestrictions),
});

`;
  if (src.includes("export const AdminView = () => {") && src.includes("const data = getAllRSVPs();")) {
    src = src.replace("export const AdminView = () => {", helper + "export const AdminView = () => {");
    src = src.replace("const data = getAllRSVPs();", "const data = getAllRSVPs().map(normalizeRsvp);");
    log.push("added record normalization in loadData");
  } else log.push("! could not add record normalization");
}

// 3. Invite modal was defined AFTER the return statement (unreachable), so it never rendered
if (!src.includes("renderInviteModal")) {
  const re = /[ \t]*\/\/ Invitation Modal\s*const InviteModal = \(\) => \(([\s\S]*?)\n\s*\);\s*return \(\s*<>\s*\{inviteModalOpen && <InviteModal \/>\}\s*<\/>\s*\);\s*/;
  const m = src.match(re);
  if (m && src.includes("if (!authenticated) {") && src.includes("<ChristmasBackground showSnow={false} showOrnaments={true} />")) {
    const body = m[1];
    src = src.replace(re, "\n  ");
    src = src.replace(
      "if (!authenticated) {",
      `// Plain function (not a component) so the textareas keep focus while typing
  const renderInviteModal = () => (${body}
  );

  if (!authenticated) {`
    );
    src = src.replace(
      "<ChristmasBackground showSnow={false} showOrnaments={true} />",
      "<ChristmasBackground showSnow={false} showOrnaments={true} />\n      {inviteModalOpen && renderInviteModal()}"
    );
    log.push("moved invite modal so it actually renders");
  } else log.push("! could not find the invite modal block to move");
}

if (src === original) {
  console.log(`${target}: nothing to change`);
} else {
  fs.copyFileSync(target, target + ".admin.bak");
  fs.writeFileSync(target, src);
  console.log(`${target}: updated (backup: ${target}.admin.bak)`);
}
log.forEach((l) => console.log(" - " + l));
