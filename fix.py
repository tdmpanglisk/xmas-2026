import re  
with open('c:/Users/tranm/xmas-2026/src/components/PotluckMenu.jsx', 'r', encoding='utf-8') as f:  
    content = f.read()  
content = re.sub(r'    }\n', '', content, flags=re.MULTILINE)  
with open('c:/Users/tranm/xmas-2026/src/components/PotluckMenu.jsx', 'w', encoding='utf-8') as f:  
    f.write(content)  
print('Done')  
