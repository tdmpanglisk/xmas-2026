import re  
with open('c:/Users/tranm/xmas-2026/src/components/RSVPForm.jsx', 'r') as f:  
    content = f.read()  
content = content.replace(');', ');\n  }', 1)  
with open('c:/Users/tranm/xmas-2026/src/components/RSVPForm.jsx', 'w') as f:  
    f.write(content)  
print('Fixed')  
