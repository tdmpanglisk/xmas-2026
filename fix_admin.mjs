import fs from 'fs';  
const file = 'c:/Users/tranm/xmas-2026/src/components/AdminView.jsx';  
let content = fs.readFileSync(file, 'utf8'); 
fs.writeFileSync(file, content);  
console.log('Fixed!'); 
