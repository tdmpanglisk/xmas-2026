c = open('src/components/Hero.jsx', 'r', encoding='utf-8').read()
# Use double quotes for the value attribute to avoid apostrophe issues
c = c.replace("value='Mah Family Ohana Hale, Honolulu, Hawai'i'", 'value="Mah Family Ohana Hale, Honolulu, Hawai\'i"')
open('src/components/Hero.jsx', 'w', encoding='utf-8').write(c)
print('Fixed')