import type { Language, NavItem, QuickAction, FeatureCard, AppSettings } from '@/types';

// ============================================================
// Centralized application constants — BIS AI Assistant
// ============================================================

export const APP_NAME = 'BIS AI Assistant';
export const APP_TAGLINE = 'AI-powered BIS information assistant';
export const APP_ORGANIZATION = 'Bureau of Indian Standards';
export const APP_DEPARTMENT = 'Department of Consumer Affairs';
export const APP_MINISTRY = 'Ministry of Consumer Affairs, Food & Public Distribution';

export const DISCLAIMER_SHORT =
  'This assistant provides informational guidance. Verify against official BIS publications and applicable regulations.';
export const DISCLAIMER_LONG =
  'This assistant is intended to help users discover and understand BIS information. Users should verify applicable requirements against the latest official BIS publications and applicable regulations. This application is not officially operated or endorsed by BIS unless explicitly authorized.';

export const DEMO_LABEL = 'Demo data';
export const AI_NOT_CONNECTED = 'AI service not connected yet';
export const VERIFICATION_REQUIRED = 'Verification required';

// ---- Languages ----

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
];

export const DEFAULT_LANGUAGE = 'en';

// ---- Navigation ----

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'assistant',
    label: 'AI Assistant',
    path: '/assistant',
    icon: 'MessageSquareText',
    description: 'Ask questions about Indian Standards and BIS services',
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
    id: 'explorer',
    label: 'Standards Explorer',
    path: '/explorer',
    icon: 'Compass',
    description: 'Browse and explore Indian Standards',
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', path: '/settings', icon: 'Settings' },
  { id: 'about', label: 'Help & About', path: '/about', icon: 'CircleHelp' },
];

export const HOME_PATH = '/';

// ---- Home dashboard quick actions ----

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'find-standard',
    title: 'Find a Standard',
    description: 'Describe your product to discover potentially relevant standards.',
    icon: 'Search',
    path: '/standards-finder',
    accent: 'primary',
  },
  {
    id: 'check-certification',
    title: 'Check Certification',
    description: 'Understand BIS certification steps and requirements.',
    icon: 'BadgeCheck',
    path: '/certification',
    accent: 'accent',
  },
  {
    id: 'find-lab',
    title: 'Find a Laboratory',
    description: 'Search for testing laboratories by product or location.',
    icon: 'FlaskConical',
    path: '/laboratories',
    accent: 'success',
  },
  {
    id: 'hallmarking',
    title: 'Hallmarking Help',
    description: 'Learn about hallmarking and verification of precious articles.',
    icon: 'Gem',
    path: '/hallmarking',
    accent: 'warning',
  },
  {
    id: 'consumer-support',
    title: 'Consumer Support',
    description: 'Get guidance on product quality, complaints and BIS marks.',
    icon: 'LifeBuoy',
    path: '/consumer',
    accent: 'neutral',
  },
  {
    id: 'explore-services',
    title: 'Explore BIS Services',
    description: 'Browse the full range of BIS services and information.',
    icon: 'Compass',
    path: '/explorer',
    accent: 'primary',
  },
];

// ---- Home feature cards ----

export const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'indian-standards',
    title: 'Indian Standards',
    description: 'Discover and understand Indian Standards relevant to your products.',
    icon: 'BookOpen',
  },
  {
    id: 'certification-licensing',
    title: 'Certification & Licensing',
    description: 'Navigate BIS certification schemes and licensing procedures.',
    icon: 'BadgeCheck',
  },
  {
    id: 'testing',
    title: 'Testing Requirements',
    description: 'Understand testing requirements and find testing laboratories.',
    icon: 'FlaskConical',
  },
  {
    id: 'schemes',
    title: 'BIS Schemes',
    description: 'Learn about various BIS certification schemes and their applicability.',
    icon: 'Layers',
  },
  {
    id: 'hallmarking',
    title: 'Hallmarking',
    description: 'Understand hallmarking of precious metals and jewellery.',
    icon: 'Gem',
  },
  {
    id: 'consumer-affairs',
    title: 'Consumer Affairs',
    description: 'Get guidance on consumer rights, product quality and complaints.',
    icon: 'LifeBuoy',
  },
  {
    id: 'laboratories',
    title: 'Laboratories',
    description: 'Find testing laboratories with relevant capabilities and recognition.',
    icon: 'Microscope',
  },
  {
    id: 'multilingual',
    title: 'Multilingual Assistance',
    description: 'Interact in multiple Indian languages for wider accessibility.',
    icon: 'Languages',
  },
];

// ---- How it works steps ----

export const HOW_IT_WORKS = [
  { id: 1, title: 'Ask your question', description: 'Type a query about a product, standard, certification or BIS service.' },
  { id: 2, title: 'AI understands your requirement', description: 'The assistant interprets your question and identifies relevant information needs.' },
  { id: 3, title: 'Relevant BIS information is retrieved', description: 'The system searches the knowledge base for applicable standards and guidance.' },
  { id: 4, title: 'Answer is presented with sources', description: 'You receive a structured answer with source references for verification.' },
];

// ---- AI Assistant quick prompts ----

export const QUICK_PROMPTS = [
  { id: 'qp1', label: 'Which standard applies to my product?', text: 'Which standard applies to my product?' },
  { id: 'qp2', label: 'How do I get BIS certification?', text: 'How do I get BIS certification?' },
  { id: 'qp3', label: 'What testing is required?', text: 'What testing is required for my product?' },
  { id: 'qp4', label: 'Help me understand hallmarking', text: 'Help me understand hallmarking' },
  { id: 'qp5', label: 'Find a relevant laboratory', text: 'Find a relevant laboratory for my product' },
];

// ---- Product categories & industries (for filters) ----

export const PRODUCT_CATEGORIES = [
  'All Categories',
  'Electrical & Electronics',
  'Food & Agriculture',
  'Chemicals & Plastics',
  'Building & Construction',
  'Textiles',
  'Automotive',
  'Mechanical Engineering',
  'Civil Engineering',
  'Consumer Goods',
  'Precious Metals',
];

export const INDUSTRIES = [
  'All Industries',
  'Manufacturing',
  'MSME',
  'Startups',
  'Importers',
  'Exporters',
  'Construction',
  'Food Processing',
  'Textiles',
  'Electronics',
];

export const LABORATORY_STATES = [
  'All States',
  'Delhi NCR',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal',
  'Telangana',
  'Rajasthan',
];

export const TEST_TYPES = [
  'All Test Types',
  'Safety Testing',
  'Performance Testing',
  'Chemical Analysis',
  'Mechanical Testing',
  'Electrical Testing',
  'Microbiological Testing',
];

export const MANUFACTURER_TYPES = [
  'Manufacturer',
  'Importer',
  'Distributor',
  'Trader',
  'Startup',
  'MSME',
];

export const INTENDED_MARKETS = [
  'Domestic (India)',
  'Export Only',
  'Both Domestic and Export',
];

export const TESTING_STATUS_OPTIONS = [
  'Not yet tested',
  'In-house testing done',
  'Third-party testing done',
  'Testing in progress',
];

// ---- Certification steps ----

export const CERTIFICATION_STEPS = [
  {
    id: 1,
    title: 'Identify Product',
    description: 'Define your product, its intended use and target market.',
    icon: 'PackageSearch',
    details: [
      'Determine the product category and classification',
      'Identify the intended end-use and user',
      'Note whether the product is for domestic or export market',
    ],
  },
  {
    id: 2,
    title: 'Identify Applicable Standard',
    description: 'Find the Indian Standard(s) that apply to your product.',
    icon: 'Search',
    details: [
      'Search for product-relevant Indian Standards',
      'Check if the standard is mandatory or voluntary',
      'Review scope and applicability',
    ],
  },
  {
    id: 3,
    title: 'Check Scheme',
    description: 'Determine which BIS certification scheme applies.',
    icon: 'Layers',
    details: [
      'Review available BIS certification schemes',
      'Identify if the product falls under mandatory certification',
      'Understand scheme-specific requirements',
    ],
  },
  {
    id: 4,
    title: 'Testing',
    description: 'Ensure product testing as per the applicable standard.',
    icon: 'FlaskConical',
    details: [
      'Identify test requirements from the standard',
      'Select a recognized testing laboratory',
      'Conduct testing and obtain test reports',
    ],
  },
  {
    id: 5,
    title: 'Application',
    description: 'Submit the BIS certification application with required documents.',
    icon: 'FileText',
    details: [
      'Prepare application forms and supporting documents',
      'Include factory details and manufacturing process',
      'Attach test reports and quality assurance documents',
    ],
  },
  {
    id: 6,
    title: 'Assessment',
    description: 'BIS conducts factory assessment and product evaluation.',
    icon: 'ClipboardCheck',
    details: [
      'BIS officers conduct factory inspection',
      'Product samples may be drawn for testing',
      'Manufacturing and quality processes are evaluated',
    ],
  },
  {
    id: 7,
    title: 'Licensing',
    description: 'Upon successful assessment, the BIS license is granted.',
    icon: 'BadgeCheck',
    details: [
      'License agreement is signed',
      'Standard mark usage authorization is granted',
      'Ongoing compliance and surveillance begin',
    ],
  },
];

// ---- Hallmarking flow steps ----

export const HALLMARKING_FLOW = [
  { id: 1, title: 'Purchase', description: 'Consumer purchases a precious metal article.', icon: 'ShoppingBag' },
  { id: 2, title: 'Hallmark Information', description: 'Check for hallmark marks and details on the article.', icon: 'Gem' },
  { id: 3, title: 'Verification', description: 'Verify hallmark authenticity through available channels.', icon: 'ShieldCheck' },
  { id: 4, title: 'Consumer Guidance', description: 'Seek guidance or raise concerns if needed.', icon: 'LifeBuoy' },
];

// ---- Settings defaults ----

export const DEFAULT_SETTINGS: AppSettings = {
  language: DEFAULT_LANGUAGE,
  theme: 'light' as const,
  showSources: true,
  compactChat: false,
  highContrast: false,
  reduceMotion: false,
  fontSize: 'medium',
  notifications: true,
  enterToSend: true,
};

export const SETTINGS_STORAGE_KEY = 'bis-ai-assistant-settings';
export const CHAT_STORAGE_KEY = 'bis-ai-assistant-chat';
