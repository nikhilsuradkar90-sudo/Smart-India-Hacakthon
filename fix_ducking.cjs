const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'LiveVoicePage.tsx');
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(
    "setTimeout(() => {\n          setVoiceState('listening');",
    "setTimeout(() => {\n          setVoiceState('listening');"
);

c = c.replace(
    "try {\n              recognitionRef.current?.start();\n          } catch(e) {}\n      }, 500);",
    "try {\n              recognitionRef.current?.start();\n          } catch(e) {}\n      }, 1500);"
);

fs.writeFileSync(p, c);
console.log("INCREASED MIC DELAY TO PREVENT DUCKING");
