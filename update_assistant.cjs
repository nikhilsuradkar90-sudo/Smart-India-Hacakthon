const fs = require('fs');
let code = fs.readFileSync('src/pages/AssistantPage.tsx', 'utf8');

code = code.replace(
  "{ text: \"Is hallmarking mandatory for gold jewelry?\", icon: <HelpCircle className=\"h-4 w-4\" /> }",
  "{ text: \"Is hallmarking mandatory for gold jewelry?\", icon: <HelpCircle className=\"h-4 w-4\" /> },\n    { text: \"Does Packaged Drinking Water require BIS certification?\", icon: <HelpCircle className=\"h-4 w-4\" /> }"
);

fs.writeFileSync('src/pages/AssistantPage.tsx', code);
