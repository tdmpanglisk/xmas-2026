with open('c:/Users/tranm/xmas-2026/src/components/RSVPForm.jsx', 'r', encoding='utf-8') as f:  
    content = f.read()  
lines = content.split('\n')  
for i, line in enumerate(lines):  
    if line.strip() == 'return (' and i  
        for j in range(i, len(lines)):  
            if lines[j].strip() == ');':  
                lines.insert(j + 1, '}')  
                break  
        break  
with open('c:/Users/tranm/xmas-2026/src/components/RSVPForm.jsx', 'w', encoding='utf-8') as f:  
    f.write('\n'.join(lines))  
print('Fixed')  
