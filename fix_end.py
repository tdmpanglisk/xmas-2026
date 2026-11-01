with open('c:/Users/tranm/xmas-2026/src/components/RSVPForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the end of file - add missing }; for FoodDetailModal
content = content.replace(
    '    );\n\n  }\n    return (\n      <>\n        {selectedFoodDetail && <FoodDetailModal />}\n      </>\n    );',
    '    );\n  };\n\n  return (\n    <>\n      {selectedFoodDetail && <FoodDetailModal />}\n    </>\n  );\n}'
)

with open('c:/Users/tranm/xmas-2026/src/components/RSVPForm.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed')