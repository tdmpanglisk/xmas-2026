with open('src/components/RSVPForm.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'message:' in line and 'RSVP saved' in line and '\\' in line:
        lines[i] = "      setSubmitResult({ success: false, message: 'RSVP saved but email notification failed. We\\'ll still receive your response!' });\n"
        print(f'Fixed line {i+1}')
        break

with open('src/components/RSVPForm.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Fixed')