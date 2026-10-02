import { aiService } from './ai-provider';
import pdfParse from 'pdf-parse';
import * as Tesseract from 'tesseract.js';
import * as multer from 'multer';
import * as express from 'express';

// Setup multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

/**
 * Extracts text from a buffer (PDF or Image)
 */
async function extractTextFromBuffer(buffer: Buffer, mimetype: string): Promise<string> {
    try {
        if (mimetype === 'application/pdf') {
            const data = await pdfParse(buffer);
            return data.text;
        } else if (mimetype.startsWith('image/')) {
            const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
            return text;
        } else if (mimetype.startsWith('text/')) {
            return buffer.toString('utf-8');
        } else {
            throw new Error(`Unsupported file type: ${mimetype}`);
        }
    } catch (err: any) {
        console.error("Text extraction failed:", err);
        throw new Error("Could not extract text from the provided file. Ensure it is a valid PDF or Image.");
    }
}

/**
 * Checks compliance of extracted text against a given standard
 */
export async function checkCompliance(fileBuffer: Buffer, mimetype: string, standard: string) {
    console.log(`[Compliance] Extracting text from ${mimetype}...`);
    const extractedText = await extractTextFromBuffer(fileBuffer, mimetype);
    
    if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("No readable text found in the document.");
    }
    
    console.log(`[Compliance] Text extracted (${extractedText.length} chars). Sending to LLM...`);

    const systemPrompt = `You are an expert BIS Compliance AI. 
    You are given an extracted Lab Test Report or Product Specification.
    Your job is to analyze the document against the Indian Standard: ${standard}.
    
    You must output your response STRICTLY as a valid JSON object, and absolutely nothing else. No markdown, no markdown JSON blocks, just pure JSON.
    
    Format:
    {
       "productName": "Extracted product name or Unknown",
       "overallStatus": "Pass" | "Fail" | "Manual Review Required",
       "summary": "A 2-3 sentence summary of your findings.",
       "parameters": [
          {
             "name": "Parameter Name (e.g. TDS, pH, Tensile Strength)",
             "extractedValue": "Value found in doc",
             "allowedLimit": "BIS limit if known, or Unknown",
             "status": "Pass" | "Fail" | "Unknown",
             "remarks": "Why it passed or failed"
          }
       ]
    }`;

    const prompt = `Analyze this document against ${standard}:\n\n${extractedText.substring(0, 15000)}`;

    try {
        const result = await aiService.generateChat([{ role: 'user', content: prompt }], systemPrompt);
        
        // Try to parse the JSON output from the LLM
        let rawJson = result.answer.trim();
        // Sometimes LLMs still wrap in markdown even if told not to. Clean it up just in case:
        if (rawJson.startsWith('\`\`\`json')) {
            rawJson = rawJson.replace(/^\`\`\`json/m, '').replace(/\`\`\`$/m, '').trim();
        } else if (rawJson.startsWith('\`\`\`')) {
            rawJson = rawJson.replace(/^\`\`\`/m, '').replace(/\`\`\`$/m, '').trim();
        }
        
        return JSON.parse(rawJson);
    } catch (err: any) {
        console.error("[Compliance] LLM or JSON Parsing failed:", err);
        throw new Error("AI failed to process the document format correctly. Please try again or use a clearer document.");
    }
}
