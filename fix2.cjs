const fs = require('fs');  
const file = 'c:/Users/tranm/xmas-2026/src/components/AdminView.jsx';  
let content = fs.readFileSync(file, 'utf8'); 
content = content.replace('const guestName = email.split(\'@\')[0].replace(/[._-]/g, \' \').replace(/\\b\\w/g, l =;', 'const guestName = email.split(\'@\')[0].replace(/[._-]/g, \' \').replace(/\\b\\w/g, l =;'); 
