// ============================================================
// Core Domain Types — BIS AI Assistant
// Phase 1 frontend architecture; designed for Phase 2 RAG/AI integration
// ============================================================

// ---- Language / Multilingual ----

export interface Language {
  code: string;
  label: string;
  nativeLabel: string;
}

export type LanguageCode = string;

// ---- AI Assistant / Chat ----

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus =
  | 'idle'
  | 'loading'
  | 'complete'
  | 'error'
  | 'demo';

export type VerificationStatus =
  | 'verified'
  | 'unverified'
  | 'demo'
  | 'pending'
  | 'not-available';

export interface AssistantMessageSection {
  id: string;
  label: string;
  type: 'info' | 'standard' | 'certification' | 'testing' | 'sources' | 'note';
  items: string[];
}

export interface SourceReference {
  id: string;
  type: 'standard' | 'document' | 'regulation' | 'guideline' | 'webpage' | 'database';
  title: string;
  identifier?: string;
  section?: string;
  clause?: string;
  page?: string;
  url?: string;
  verificationStatus: VerificationStatus;
  description?: string;
}

export interface AssistantMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status: MessageStatus;
  isDemo?: boolean;
  sections?: AssistantMessageSection[];
  sources?: SourceReference[];
  helpful?: boolean | null;
  language?: LanguageCode;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: AssistantMessage[];
  createdAt: string;
  updatedAt: string;
  language: LanguageCode;
}

export interface QuickPrompt {
  id: string;
  label: string;
  text: string;
  icon?: string;
}

// ---- Standards ----

export type StandardStatus = 'active' | 'withdrawn' | 'draft' | 'under-revision' | 'superseded';

export type StandardType = 'product' | 'test-method' | 'safety' | 'management-system' | 'terminology' | 'process';

export interface Standard {
  id: string;
  identifier: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  type: StandardType;
  status: StandardStatus;
  publishedYear: number;
  lastUpdated: string;
  scope?: string;
  keyRequirements?: string[];
  relatedStandards?: string[];
  certificationRelevant: boolean;
  testingRelevant: boolean;
  isDemo: boolean;
}

export interface StandardSearchResult {
  items: Standard[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StandardSearchFilters {
  query?: string;
  category?: string;
  industry?: string;
  type?: StandardType | 'all';
  status?: StandardStatus | 'all';
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'relevance' | 'year-desc' | 'year-asc' | 'title-asc' | 'updated-desc';
}

// ---- Certification ----

export interface CertificationScheme {
  id: string;
  name: string;
  description: string;
  applicability: string;
  isDemo: boolean;
}

export interface CertificationStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  details: string[];
}

export interface CertificationQuestionnaireInput {
  productName: string;
  productCategory: string;
  manufacturerType: string;
  intendedMarket: string;
  existingStandard: string;
  testingStatus: string;
}

export interface CertificationAssessment {
  id: string;
  input: CertificationQuestionnaireInput;
  status: 'awaiting-verification' | 'demo';
  summary: string;
  suggestedSteps: string[];
  isDemo: boolean;
  createdAt: string;
}

// ---- Laboratory ----

export type LaboratoryRecognition = 'bis-recognized' | 'nabl-accredited' | 'demo' | 'pending';

export interface Laboratory {
  id: string;
  name: string;
  location: string;
  state: string;
  capabilities: string[];
  productCategories: string[];
  recognition: LaboratoryRecognition;
  recognitionLabel: string;
  contact?: string;
  isDemo: boolean;
}

export interface LaboratorySearchFilters {
  query?: string;
  state?: string;
  productCategory?: string;
  testType?: string;
  recognition?: LaboratoryRecognition | 'all';
  page?: number;
  pageSize?: number;
}

export interface LaboratorySearchResult {
  items: Laboratory[];
  total: number;
  page: number;
  pageSize: number;
}

// ---- Hallmarking ----

export interface HallmarkingInformation {
  id: string;
  title: string;
  description: string;
  category: string;
  isDemo: boolean;
}

export interface HallmarkingFlowStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

// ---- Consumer ----

export interface ConsumerQuery {
  id: string;
  category: string;
  title: string;
  description: string;
  isDemo: boolean;
}

// ---- Service result envelope ----

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
  isDemo: boolean;
}

// ---- Settings ----

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  language: LanguageCode;
  theme: ThemeMode;
  showSources: boolean;
  compactChat: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  notifications: boolean;
  enterToSend: boolean;
}

// ---- Navigation ----

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  description?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  accent: 'primary' | 'accent' | 'success' | 'warning' | 'neutral';
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}
