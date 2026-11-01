// apply-party-names.mjs
// Usage (from project root): node apply-party-names.mjs
// Adds party member names to the RSVP form WITHOUT changing the Google Sheet:
// names are packed into the existing "Special Requests" column as "[Party: A, B] message"
// and unpacked again when syncing back. Patches RSVPForm, storage, emailService, AdminView.
// Backs up each changed file to <file>.party.bak. Safe to run twice.
import fs from "node:fs";
import path from "node:path";

const T = {
  form: {
    name: /^RSVPForm\.(jsx|js|tsx)$/,
    edits: [
      {
        // partyNames in initial state + reset state (2 matches)
        find: /attendance: 'yes',\s*partySize: 1,\s*foodSelections: \[\],/g,
        replace: "attendance: 'yes', partySize: 1, partyNames: [], foodSelections: [],",
        count: 2, done: "partyNames: [],",
      },
      {
        find: "const toggleDietary = (dietary) => {",
        replace: `const handlePartyName = (index, value) => {
    setFormData(prev => {
      const names = [...(prev.partyNames || [])];
      names[index] = value;
      return { ...prev, partyNames: names };
    });
  };

  const toggleDietary = (dietary) => {`,
        count: 1, done: "const handlePartyName",
      },
      {
        find: "const rsvpData = { ...formData, foodSelections, submittedAt: new Date().toISOString() };",
        replace: `// Only keep as many names as there are extra guests; drop blanks
    const partyNames = formData.attendance === 'no'
      ? []
      : Array.from({ length: Math.max(0, formData.partySize - 1) }, (_, i) => ((formData.partyNames || [])[i] || '').trim()).filter(Boolean);
    const rsvpData = { ...formData, partyNames, foodSelections, submittedAt: new Date().toISOString() };`,
        count: 1, done: "const partyNames = formData.attendance",
      },
      {
        find: `{errors.partySize && <p className="mt-1 text-sm text-red-400">{errors.partySize}</p>}`,
        replace: `{errors.partySize && <p className="mt-1 text-sm text-red-400">{errors.partySize}</p>}
                    {formData.partySize > 1 && (
                      <div className="mt-4">
                        <label className="label">Names of your guests (optional)</label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {Array.from({ length: formData.partySize - 1 }, (_, i) => (
                            <input
                              key={i}
                              type="text"
                              className="input-field"
                              placeholder={\`Guest \${i + 2} name\`}
                              value={(formData.partyNames || [])[i] || ''}
                              onChange={e => handlePartyName(i, e.target.value)}
                              autoComplete="off"
                            />
                          ))}
                        </div>
                      </div>
                    )}`,
        count: 1, done: "handlePartyName(i, e.target.value)",
      },
    ],
  },

  storage: {
    name: /^storage\.(js|jsx|ts)$/,
    edits: [
      {
        find: "const ADMIN_SESSION_KEY = 'xmas2026_admin_session';",
        replace: `const ADMIN_SESSION_KEY = 'xmas2026_admin_session';

// Party names live inside the existing "Special Requests" sheet column ("[Party: A, B] message"),
// so the Google Sheet needs no new columns.
const PARTY_TAG = /^\\[Party:\\s*([^\\]]*)\\]\\s*/;
const cleanPartyName = (n) => String(n).replace(/[\\[\\],]/g, ' ').replace(/\\s+/g, ' ').trim();
const packSpecialRequests = (r) => {
  const names = (r.partyNames || []).map(cleanPartyName).filter(Boolean);
  const msg = r.specialRequests || '';
  return names.length ? \`[Party: \${names.join(', ')}]\${msg ? ' ' + msg : ''}\` : msg;
};
const unpackSpecialRequests = (raw) => {
  const text = String(raw || '');
  const m = text.match(PARTY_TAG);
  if (!m) return { partyNames: [], specialRequests: text };
  return {
    partyNames: m[1].split(',').map(s => s.trim()).filter(Boolean),
    specialRequests: text.slice(m[0].length),
  };
};`,
        count: 1, done: "const packSpecialRequests",
      },
      {
        find: "body: JSON.stringify(rsvpData),",
        replace: "body: JSON.stringify({ ...rsvpData, specialRequests: packSpecialRequests(rsvpData) }),",
        count: 1, done: "packSpecialRequests(rsvpData) })",
      },
      {
        find: "specialRequests: row['Special Requests'] || row['specialRequests'] || row['Special'] || '',",
        replace: "...unpackSpecialRequests(row['Special Requests'] || row['specialRequests'] || row['Special'] || ''),",
        count: 1, done: "...unpackSpecialRequests(",
      },
      {
        find: "'Name', 'Email', 'Phone', 'Attendance', 'Party Size',",
        replace: "'Name', 'Email', 'Phone', 'Attendance', 'Party Size', 'Party Names',",
        count: 1, done: "'Party Size', 'Party Names',",
      },
      {
        find: /(\r?\n[ \t]*)r\.partySize,(\r?\n)/g,
        replace: (m, a, b) => `${a}r.partySize,${a}(r.partyNames || []).join('; '),${b}`,
        count: 1, done: "(r.partyNames || []).join('; '),",
      },
      {
        find: "(r.specialRequests || '').substring(0, 80) || 'None',",
        replace: "([(r.partyNames || []).length ? 'Party: ' + r.partyNames.join(', ') : '', r.specialRequests || ''].filter(Boolean).join(' | ')).substring(0, 80) || 'None',",
        count: 1, done: "'Party: ' + r.partyNames.join",
      },
    ],
  },

  email: {
    name: /^emailService\.(js|jsx|ts)$/,
    edits: [
      {
        find: "party_size: rsvpData.partySize,",
        replace: "party_size: rsvpData.partySize,\n      party_names: (rsvpData.partyNames || []).join(', ') || 'None',",
        count: 2, done: "party_names:",
      },
    ],
  },

  admin: {
    name: /^AdminView\.(jsx|js|tsx)$/,
    edits: [
      {
        find: `<DetailItem label="Party Size"`,
        replace: `<DetailItem label="Party Names" value={(rsvp.partyNames||[]).length>0?rsvp.partyNames.join(", "):"None"} /><DetailItem label="Party Size"`,
        count: 1, done: 'label="Party Names"',
      },
      {
        // only present if apply-admin-fix.mjs was run; optional
        find: "dietaryRestrictions: asArray(r.dietaryRestrictions),",
        replace: "dietaryRestrictions: asArray(r.dietaryRestrictions),\n  partyNames: asArray(r.partyNames),",
        count: 1, done: "partyNames: asArray(", optional: true,
      },
    ],
  },
};

function findFile(dir, re, depth = 0) {
  if (depth > 5) return null;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".") || e.name === "dist" || e.name === "docs") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { const r = findFile(p, re, depth + 1); if (r) return r; }
    else if (re.test(e.name)) return p;
  }
  return null;
}

const countOf = (src, find) =>
  typeof find === "string" ? src.split(find).length - 1 : (src.match(find) || []).length;

let problems = 0;
for (const [key, spec] of Object.entries(T)) {
  const file = findFile(process.cwd(), spec.name);
  if (!file) { console.warn(`! ${key}: file not found (looked for ${spec.name})`); problems++; continue; }

  let src = fs.readFileSync(file, "utf8");
  const original = src;
  const notes = [];

  for (const ed of spec.edits) {
    if (src.includes(ed.done)) { notes.push("already done"); continue; }
    const n = countOf(src, ed.find);
    if (n !== ed.count) {
      if (!ed.optional) { problems++; notes.push(`! not applied (found ${n}, expected ${ed.count}): ${String(ed.find).slice(0, 60)}`); }
      continue;
    }
    // keep the file's own line endings (Windows files use \r\n)
    const crlf = src.includes("\r\n");
    const eol = (t) => (crlf ? t.replace(/\r?\n/g, "\r\n") : t);
    src = typeof ed.find === "string"
      ? src.split(ed.find).join(eol(ed.replace))
      : src.replace(ed.find, typeof ed.replace === "function" ? (...a) => eol(ed.replace(...a)) : () => eol(ed.replace));
    notes.push("applied");
  }

  if (src !== original) {
    fs.copyFileSync(file, file + ".party.bak");
    fs.writeFileSync(file, src);
  }
  console.log(`${file}: ${notes.join(", ")}`);
}
if (problems) console.log(`\n${problems} edit(s) need attention (see "!" lines above).`);
