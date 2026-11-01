# Fix the SVG structure properly
with open('src/components/Hero.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Add closing </g> for the glow group before pigGradient group
content = content.replace(
    '</path>\n                  </g>\n<g fill="url(#pigGradient)"',
    '</path>\n                  </g>\n                  </g>\n<g fill="url(#pigGradient)"'
)

# Fix 2: Remove extra </g> before </svg> - there's an extra closing tag
content = content.replace(
    '</g>\n                </svg>',
    '                </svg>'
)

# Fix 3: Remove the extra </g> that appears before </svg>
# The pattern is: </g>\n                </svg> -> </svg>
# But we need to be more specific - there might be multiple
# Let's do a more targeted fix

with open('src/components/Hero.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed SVG structure')