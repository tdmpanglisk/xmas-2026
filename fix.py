with open('c:/Users/tranm/xmas-2026/src/components/RSVPForm.jsx', 'r', encoding='utf-8') as f:  
    content = f.read()  
content = content.replace('    );', '    );\n  }', 1)  
with open('c:/Users/tranm/xmas-2026/src/components/RSVPForm.jsx', 'w', encoding='utf-8') as f:  
    f.write(content)  
print('Fixed')  
