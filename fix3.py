with open('c:/Users/tranm/xmas-2026/src/components/PotluckMenu.jsx', 'r', encoding='utf-8') as f:  
    content = f.read()  
# Fix missing closing braces in getFoodBringers  
content = content.replace('        } else {', '        } else {')  
content = content.replace('          console.log(\'[PotluckMenu] NO MATCH:\', f.name, f.category, f.id, \'vs\', food.name, food.category, food.id);\n          });', '          console.log(\'[PotluckMenu] NO MATCH:\', f.name, f.category, f.id, \'vs\', food.name, food.category, food.id);\n        }\n          });')  
with open('c:/Users/tranm/xmas-2026/src/components/PotluckMenu.jsx', 'w', encoding='utf-8') as f:  
    f.write(content)  
print('Done')  
