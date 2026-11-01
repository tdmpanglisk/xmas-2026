const fs = require('fs');  
const file = 'c:/Users/tranm/xmas-2026/src/components/AdminView.jsx';  
let c = fs.readFileSync(file, 'utf8');  
const lines = c.split('\n');  
lines.splice(100, 1);  
fs.writeFileSync(file, lines.join('\n'));  
console.log('Removed duplicate line!'); 
