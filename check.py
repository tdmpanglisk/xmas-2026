with open('c:/Users/tranm/xmas-2026/src/components/PotluckMenu.jsx', 'r', encoding='utf-8') as f:  
    lines = f.readlines()  
for i, line in enumerate(lines[30:45], 31):  
    print(f'{i}: {repr(line)}')  
