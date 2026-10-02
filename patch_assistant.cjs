const fs = require('fs');
const p = 'src/pages/AssistantPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

// Update import to include useLocation
c = c.replace(/import\s*\{\s*useNavigate\s*\}\s*from\s*'react-router-dom';/, "import { useNavigate, useLocation } from 'react-router-dom';");

// Insert useLocation and useEffect inside AssistantPage
const functionStart = `export function AssistantPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();`;

const newStart = `export function AssistantPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();`;

c = c.replace(functionStart, newStart);

// Now inject the useEffect right after handleSend is declared
const handleSendBlock = `const handleSend = useCallback(async (text?: string) => {
    let queryText = (text || input).trim();`;

const useEffectInjection = `
  // Auto-send if initialPrompt was passed via navigation state
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
  }, [location.state, navigate, handleSend]);

  const handleSend = useCallback(async (text?: string) => {
    let queryText = (text || input).trim();`;

c = c.replace(handleSendBlock, useEffectInjection);

fs.writeFileSync(p, c);
console.log("Updated AssistantPage");
