const fs = require('fs');
const p = 'src/pages/AssistantPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

const badBlock = `  // Auto-send if initialPrompt was passed via navigation state
  useEffect(() => {
    if (location.state?.initialPrompt) {
      const prompt = location.state.initialPrompt;
      // Clear the state so it doesn't re-trigger on reload
      navigate(location.pathname, { replace: true, state: {} });
      // Short delay to ensure state is ready before triggering handleSend
      setTimeout(() => {
        handleSend(prompt);
      }, 100);
    }
  }, [location.state, navigate, handleSend]);`;

// Remove it from its current position
c = c.replace(badBlock, '');

// Find where handleSend ends, or just inject it right after handleSend is declared. Wait, handleSend is a block. 
// We can just inject it right before `const handleClear = useCallback(() => {` which typically follows or just before `const handleCopy`

// Let's find a safe place after handleSend.
// Searching for `const handleClear =` or `const handleFeedback =`
const safeInjectionPoint = `  const handleClear = useCallback(() => {`;

if (c.includes(safeInjectionPoint)) {
    c = c.replace(safeInjectionPoint, badBlock + '\n\n' + safeInjectionPoint);
    fs.writeFileSync(p, c);
    console.log("Moved useEffect block!");
} else {
    console.log("Could not find safe injection point");
}
