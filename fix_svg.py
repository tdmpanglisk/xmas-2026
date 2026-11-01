# Fix the SVG structure in Hero.jsx
with open('src/components/Hero.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the missing closing tag for the glow group
# The glow group opens at line ~108 and needs to close before the pigGradient group
# Find: </path>\n                  </g>\n<g fill="url(#pigGradient)"
# Replace with: </path>\n                  </g>\n                  </g>\n<g fill="url(#pigGradient)"

content = content.replace(
    '</path>\n                  </g>\n<g fill="url(#pigGradient)"',
    '</path>\n                  </g>\n                  </g>\n<g fill="url(#pigGradient)"'
)

# Also fix the extra closing </g> at the end of the SVG groups
# The structure has an extra </g> after the rect at the end
# Find the pattern where there's an extra </g> before </svg>
content = content.replace(
    '</g>\n                </svg>',
    '</svg>'
)

with open('src/components/Hero.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed SVG structure')