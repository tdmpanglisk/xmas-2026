with open('c:/Users/tranm/xmas-2026/src/components/PotluckMenu.jsx', 'r', encoding='utf-8') as f:  
    content = f.read()  
# Add missing } before catch  
content = content.replace('      } catch (error) {', '      }\n      } catch (error) {')  
with open('c:/Users/tranm/xmas-2026/src/components/PotluckMenu.jsx', 'w', encoding='utf-8') as f:  
    f.write(content)  
print('Done')  
