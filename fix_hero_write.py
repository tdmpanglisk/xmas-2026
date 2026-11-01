# This script writes the complete new Hero.jsx
import base64

# We'll write the content directly using a Python multi-line string approach
# Read the current (corrupted) file first to get the basic structure
with open('src/components/Hero.jsx', 'r', encoding='utf-8') as f:
    current = f.read()

print(f"Current content: {repr(current[:50])}")

# The full new content as a multi-part write
# We'll write it in chunks to avoid issues