c = open('src/components/Hero.jsx', 'r', encoding='utf-8').read()
c = c.replace("Hawai\\'i", "Hawai'i")
open('src/components/Hero.jsx', 'w', encoding='utf-8').write(c)
print('Fixed apostrophe with HTML entity')