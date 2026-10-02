const fs = require('fs');
const p = 'src/data/constants.ts';
let c = fs.readFileSync(p, 'utf-8');

const oldArrayMatch = c.match(/export const NAV_ITEMS: NavItem\[\] = \[\s*\{[\s\S]*?\}\s*,\s*\];/);
if (!oldArrayMatch) {
    console.log("Could not find NAV_ITEMS array");
    // Just in case the regex failed because of the ending, let's try a split-based replacement
}

const newArray = `export const NAV_ITEMS: NavItem[] = [
  {
    id: 'assistant',
    label: 'AI Assistant',
    path: '/assistant',
    icon: 'MessageSquareText',
    description: 'Ask questions about Indian Standards and BIS services',
  },
  {
    id: 'voice-mode',
    label: 'Live Voice Mode',
    path: '/voice-mode',
    icon: 'Mic',
    description: 'Continuous hands-free AI voice assistant',
  },
  {
    id: 'compliance',
    label: 'AI Compliance Checker',
    path: '/compliance',
    icon: 'CheckCircle',
    description: 'Verify product specs against BIS standards using AI',
    color: 'bg-green-500/10 text-green-600',
  },
  {
    id: 'standards-finder',
    label: 'Standards Finder',
    path: '/standards-finder',
    icon: 'Search',
    description: 'Find relevant standards from product descriptions',
  },
  {
    id: 'certification',
    label: 'Certification Guide',
    path: '/certification',
    icon: 'BadgeCheck',
    description: 'Understand BIS certification procedures',
  },
  {
    id: 'tracker',
    label: 'Certification Tracker',
    path: '/tracker',
    icon: 'ListTodo',
    description: 'Track your BIS application progress step-by-step',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    id: 'estimator',
    label: 'Cost Estimator',
    path: '/estimator',
    icon: 'Calculator',
    description: 'Calculate BIS fees and timelines instantly',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    id: 'laboratories',
    label: 'Laboratory Finder',
    path: '/laboratories',
    icon: 'FlaskConical',
    description: 'Find testing laboratories',
  },
  {
    id: 'hallmarking',
    label: 'Hallmarking',
    path: '/hallmarking',
    icon: 'Gem',
    description: 'Understand hallmarking requirements',
  },
  {
    id: 'consumer',
    label: 'Consumer Help',
    path: '/consumer',
    icon: 'LifeBuoy',
    description: 'Consumer guidance and support',
  },
  {
    id: 'alerts',
    label: 'Proactive Alerts',
    path: '/alerts',
    icon: 'Bell',
    description: 'Subscribe to standards and get amendment alerts',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    id: 'explorer',
    label: 'Standards Explorer',
    path: '/explorer',
    icon: 'Compass',
    description: 'Browse and explore Indian Standards',
  },
];`;

const startIndex = c.indexOf('export const NAV_ITEMS: NavItem[] = [');
const endIndex = c.indexOf('export const BOTTOM_NAV_ITEMS: NavItem[] = [');

if (startIndex !== -1 && endIndex !== -1) {
    c = c.substring(0, startIndex) + newArray + '\n\n' + c.substring(endIndex);
    fs.writeFileSync(p, c);
    console.log("NAV_ITEMS successfully reordered!");
} else {
    console.log("Could not find start or end index.");
}
