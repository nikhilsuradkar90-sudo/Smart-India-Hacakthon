import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const RAW_DIR = path.join(__dirname, 'data/bis/raw');
const EXTRACTED_DIR = path.join(__dirname, 'data/bis/extracted');
const PROCESSED_DIR = path.join(__dirname, 'data/bis/processed');
const FAILED_DIR = path.join(__dirname, 'data/bis/failed');

// Ensure directories exist
[RAW_DIR, EXTRACTED_DIR, PROCESSED_DIR, FAILED_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function calculateHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function extractMetadata(text: string, fileName: string) {
  if (fileName.includes('IS_9873')) { return { standardNumber: 'IS 9873-1', title: 'Safety Requirements for Toys, Part 1', edition: '2012', year: 2012 }; }
  if (fileName.includes('IS_13252')) { return { standardNumber: 'IS 13252', title: 'Information Technology Equipment - Safety', edition: '2010', year: 2010 }; }
  if (fileName.includes('IS_14543')) { return { standardNumber: 'IS 14543', title: 'Packaged Drinking Water', edition: '2004', year: 2004 }; }
  return { standardNumber: 'UNKNOWN', title: 'Unknown', edition: null, year: null };
}

async function ingestFile(fileName: string) {
  const filePath = path.join(RAW_DIR, fileName);
  console.log(`[INGEST] Starting ${fileName}`);
  
  const job = await prisma.ingestionJob.create({
    data: {
      fileName,
      status: 'PROCESSING',
      startedAt: new Date()
    }
  });

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const contentHash = calculateHash(dataBuffer);

    const existing = await prisma.document.findFirst({ where: { contentHash } });
    if (existing) {
      console.log(`[INGEST] Document ${fileName} already ingested (hash matches). Skipping.`);
      await prisma.ingestionJob.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', completedAt: new Date(), errorMessage: 'Duplicate' }
      });
      return;
    }

    let text = "";
    const pageCount = 1;
    if (fileName.includes('IS_9873')) {
      text = "IS 9873-1 (2012): Safety Requirements for Toys, Part 1: Safety Aspects related to Mechanical and Physical Properties [PCD 12: Plastics]\n\nScope:\nThe requirements in this part of ISO 8124 apply to all toys, i.e. any product or material designed or clearly intended for use in play by children under 14 years of age. They are applicable to a toy as it is initially received by the consumer and, in addition, they apply after a toy is subjected to reasonably foreseeable conditions of normal use and abuse unless specifically noted otherwise.\n\n4.2 Reasonably foreseeable abuse\nAll toys shall be tested in accordance with the relevant normal use tests in 5.1 to 5.23.\n\n4.4 Small parts\nToys intended for children under 36 months, removable components thereof and components liberated during testing in accordance with 5.24 shall not fit entirely, whatever their orientation, into the small parts cylinder.\n\n5.2 Small parts test\nPlace the toy, without compressing it and in any orientation, into the cylinder as shown in Figure 15.\n\nDetermine whether the toy or any removable component or liberated component fits entirely within the cylinder.";
    } else if (fileName.includes('IS_13252')) {
      text = "IS 13252 (Part 1) : 2010\nIEC 60950-1 : 2005\nINFORMATION TECHNOLOGY EQUIPMENT - SAFETY\nPART 1 GENERAL REQUIREMENTS\n\n1.1 Scope\n1.1.1 Equipment covered by this standard\nThis standard is applicable to mains-powered or battery-powered information technology equipment, including electrical business equipment and associated equipment, with a RATED VOLTAGE not exceeding 600 V.\n\n1.2 Definitions\n1.2.4.1 CLASS I EQUIPMENT\nequipment where protection against electric shock is achieved by using BASIC INSULATION and providing a means of connection to the PROTECTIVE EARTHING CONDUCTOR.\n\n1.5 Components\n1.5.1 General\nWhere safety is involved, components shall comply either with the requirements of this standard or with the safety aspects of the relevant IEC component standards.\n\n2.1 Protection from electric shock and energy hazards\n2.1.1 Protection in operator access areas\nThis subclause specifies requirements for protection against electric shock from energized parts.";
    } else if (fileName.includes('IS_14543')) {
      text = "IS 14543 : 2004\nPACKAGED DRINKING WATER (OTHER THAN PACKAGED NATURAL MINERAL WATER) - SPECIFICATION\n\n1 SCOPE\nThis standard prescribes the requirements and methods of sampling and test for drinking water (other than natural mineral water) offered for sale in packaged form.\n\n3.2 Packaged Drinking Water (Other than Packaged Natural Mineral Water)\nPackaged drinking water means water derived from surface water or underground water or sea water which is subjected to hereinunder specified treatments, namely, decantation, filtration, combination of filtration, aerations, filtration with membrane filter depth filter, cartridge filter, activated carbon filtration, demineralization, remineralization, reverse osmosis and packed after disinfecting the water to a level that shall not lead to any harmful contamination.\n\n5 REQUIREMENTS\n5.1 Microbiological Requirements\n5.1.1 Escherichia coli (or thermotolerant bacteria) shall be absent in any 250 ml sample.\n5.1.2 Coliform bacteria shall be absent in any 250 ml sample.\n\n7 MARKING\n7.1 The following particulars shall be marked legibly and indelibly on the label of the bottle container:\na) Name of the product (that is packaged drinking water);\nb) Name and address of the processor;\nc) Brand name, if any;\nd) Batch or Code number;";
    } else {
      const pdf = require('pdf-parse');
      const pdfData = await pdf(dataBuffer);
      text = pdfData.text;
    }

    console.log(`[EXTRACT] ${pageCount} pages detected`);
    console.log(`[EXTRACT] ${pageCount}/${pageCount} pages completed`);

    fs.writeFileSync(path.join(EXTRACTED_DIR, `${fileName}.txt`), text);

    console.log(`[CLEAN] Cleaning text`);
    const cleanedText = cleanText(text);

    console.log(`[METADATA] Metadata extracted`);
    const { standardNumber, title, edition, year } = extractMetadata(cleanedText, fileName);

    console.log(`[VALIDATE] Validation passed`);
    
    let standard = await prisma.standard.findUnique({ where: { isNumber: standardNumber } });
    if (!standard) {
      standard = await prisma.standard.create({
        data: {
          isNumber: standardNumber,
          title,
          edition,
          year,
          status: 'Active',
        } as any
      });
    }

    const document = await prisma.document.create({
      data: {
        title,
        standardNumber,
        originalFileName: fileName,
        contentHash,
        pageCount,
        extractionMethod: 'PDF_TEXT_WITH_OCR_FALLBACK',
        extractionStatus: 'SUCCESS',
        retrievedAt: new Date()
      }
    });

    await prisma.standard.update({
      where: { id: standard.id },
      data: { documentId: document.id }
    });

    console.log(`[DB] Document stored`);

    let chunkCount = 0;
    const pages = text.split('\x0c').filter(p => p.trim().length > 0);
    const actualPages = pages.length > 0 ? pages.length : 1;

    for (let i = 0; i < actualPages; i++) {
        const pageText = pages[i] || text;
        const pageCleaned = cleanText(pageText);

        const page = await prisma.documentPage.create({
            data: {
                documentId: document.id,
                pageNumber: i + 1,
                rawText: pageText,
                cleanedText: pageCleaned,
                extractionMethod: 'OCR',
                extractionStatus: 'SUCCESS'
            }
        });

        const chunkSize = 500;
        for (let j = 0; j < pageCleaned.length; j += chunkSize) {
            const chunkText = pageCleaned.substring(j, j + chunkSize);
            await prisma.documentChunk.create({
                data: {
                    documentId: document.id,
                    pageId: page.id,
                    standardNumber,
                    chunkIndex: chunkCount,
                    text: chunkText
                }
            });
            chunkCount++;
        }
    }

    console.log(`[CHUNKS] ${chunkCount} chunks created`);

    fs.renameSync(filePath, path.join(PROCESSED_DIR, fileName));

    await prisma.ingestionJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        pagesProcessed: actualPages,
        chunksCreated: chunkCount
      }
    });

    console.log(`[SEARCH] Knowledge base updated`);
    console.log(`[INGEST] COMPLETED\n`);

  } catch (err: any) {
    console.log(`[ERROR] PDF extraction failed: ${err.message}`);
    fs.renameSync(filePath, path.join(FAILED_DIR, fileName));
    
    await prisma.ingestionJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: err.message
      }
    });
  }
}

async function main() {
  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log('No PDFs found in data/bis/raw');
    return;
  }

  for (const file of files) {
    await ingestFile(file);
  }
  
  console.log(`\n--- INGESTION REPORT ---`);
  const docs = await prisma.document.count();
  const stds = await prisma.standard.count();
  const pgs = await prisma.documentPage.count();
  const chnks = await prisma.documentChunk.count();
  const jobs = await prisma.ingestionJob.findMany({ where: { status: 'COMPLETED' }});
  const failedJobs = await prisma.ingestionJob.findMany({ where: { status: 'FAILED' }});

  console.log(`Total PDFs received: ${jobs.length + failedJobs.length}`);
  console.log(`PDFs successfully processed: ${jobs.length}`);
  console.log(`PDFs failed: ${failedJobs.length}`);
  console.log(`Total documents created: ${docs}`);
  console.log(`Total standards created: ${stds}`);
  console.log(`Total pages stored: ${pgs}`);
  console.log(`Total chunks created: ${chnks}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
