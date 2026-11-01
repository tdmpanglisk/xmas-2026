import re

with open('src/components/RSVPForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the structural issue: move the "no attendance" block inside step 2
# Find the pattern where step 2 closes and the no attendance block appears
# The issue is: step 2 ends with )} then {formData.attendance === 'no' && (...) appears

# First, let's fix the string quote issue
content = content.replace("'RSVP saved but email notification failed. We'll still receive your response!'", 
    '"RSVP saved but email notification failed. We\'ll still receive your response!"')

# Fix the JSX structure - the no attendance block should be inside step 2
# Find: {step === 2 && ( ... )} {formData.attendance === 'no' && ...} {step === 3 && ...
# Replace with: {step === 2 && ( ... {formData.attendance === 'no' && ...} )} {step === 3 && ...

# This is complex to do with regex. Let me try a simpler approach - 
# Find the step 2 block end and the no attendance block, and merge them.

# Pattern: step 2 block ends with "          )}" followed by newline and "{formData.attendance === 'no'"
pattern = r'(\s+\)\}\n)({formData\.attendance === \'no\' && \(.*?\)\}\n)'
replacement = r'\1              \2'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Also need to ensure the no attendance block is properly indented and inside step 2
# Let's try a more targeted fix

# Find the step 2 block content and ensure no attendance is inside
# The step 2 block starts with "{step === 2 && (" and ends with "          )}"
# The no attendance block should be before that closing

# Let's do a simpler fix: remove the standalone no attendance block and add it inside step 2
# First, extract the no attendance block
no_attendance_match = re.search(r'\{formData\.attendance === \'no\' && \(.*?\)\}', content, re.DOTALL)
if no_attendance_match:
    no_attendance_block = no_attendance_match.group(0)
    # Remove the standalone block
    content = content.replace(no_attendance_block + '\n', '')
    # Now insert it inside step 2 before the closing )}
    # Find the step 2 closing
    step2_end = content.find('          )}\n\n          {/* Step 3: Potluck & Details */}')
    if step2_end > 0:
        # Insert before the step 2 closing
        insert_pos = step2_end
        content = content[:insert_pos] + '              ' + no_attendance_block + '\n          ' + content[insert_pos:]

with open('src/components/RSVPForm.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed RSVPForm.jsx structure')