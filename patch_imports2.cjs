const fs = require('fs');
const path = require('path');

const pComp = path.join(__dirname, 'server', 'compliance.ts');
let cComp = fs.readFileSync(pComp, 'utf-8');
cComp = cComp.replace("import Tesseract from 'tesseract.js';", "import * as Tesseract from 'tesseract.js';");
cComp = cComp.replace("import express from 'express';", "import * as express from 'express';");
cComp = cComp.replace("import multer from 'multer';", "import * as multer from 'multer';");
fs.writeFileSync(pComp, cComp);

const pGem = path.join(__dirname, 'server', 'gemini-voice.ts');
let cGem = fs.readFileSync(pGem, 'utf-8');
cGem = cGem.replace("import { GoogleGenerativeAI } from '@google/generative-ai';", "const { GoogleGenerativeAI } = require('@google/generative-ai');");
fs.writeFileSync(pGem, cGem);

console.log("Fixed imports!");
