import base64

# This script will write the new Hero.jsx from base64
# The base64 content will be read from hero_new_b64.txt
with open('hero_new_b64.txt', 'r') as f:
    encoded = f.read().strip()

content = base64.b64decode(encoded).decode('utf-8')
with open('src/components/Hero.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Hero.jsx written successfully from base64")