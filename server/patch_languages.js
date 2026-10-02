const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'data', 'constants.ts');
let c = fs.readFileSync(p, 'utf-8');

const oldLanguagesBlock = `export const LANGUAGES: Language[] = [
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
];`;

const newLanguagesBlock = `export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া' },
  { code: 'mai', label: 'Maithili', nativeLabel: 'मैथिली' },
  { code: 'sat', label: 'Santali', nativeLabel: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'ks', label: 'Kashmiri', nativeLabel: 'कॉशुर' },
  { code: 'ne', label: 'Nepali', nativeLabel: 'नेपाली' },
  { code: 'gom', label: 'Konkani', nativeLabel: 'कोंकणी' },
  { code: 'sd', label: 'Sindhi', nativeLabel: 'सिन्धी' },
  { code: 'doi', label: 'Dogri', nativeLabel: 'डोगरी' },
  { code: 'mni', label: 'Manipuri', nativeLabel: 'মৈতৈলোন্' },
  { code: 'brx', label: 'Bodo', nativeLabel: 'बड़ो' },
  { code: 'sa', label: 'Sanskrit', nativeLabel: 'संस्कृतम्' }
];`;

// Doing a regex replacement to capture the old languages block accurately
const langRegex = /export const LANGUAGES: Language\[\] = \[[\s\S]*?\];/;
c = c.replace(langRegex, newLanguagesBlock);

fs.writeFileSync(p, c);
console.log("Added 22 scheduled Indian languages to constants.ts!");
