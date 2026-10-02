const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'TrackerDashboardPage.tsx');
let c = fs.readFileSync(p, 'utf-8');

const oldLoad = `    if (savedSteps) {
      try {
        setSteps(JSON.parse(savedSteps));
      } catch (e) {
        // ignore
      }
    }`;

const newLoad = `    if (savedSteps) {
      try {
        const parsedSteps = JSON.parse(savedSteps);
        // Merge saved completion status with DEFAULT_STEPS to preserve icon functions!
        setSteps(DEFAULT_STEPS.map(defaultStep => {
            const savedStep = parsedSteps.find((s: any) => s.id === defaultStep.id);
            return savedStep ? { ...defaultStep, completed: savedStep.completed } : defaultStep;
        }));
      } catch (e) {
        // ignore
      }
    }`;

c = c.replace(oldLoad, newLoad);
fs.writeFileSync(p, c);
console.log("FIXED LOCALSTORAGE HYDRATION BUG");
