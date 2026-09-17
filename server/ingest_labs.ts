import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import axios from 'axios';

const prisma = new PrismaClient();
const BASE_URL = 'https://lims.bis.gov.in/home/labs/';
const SOURCE_NAME = 'BIS LIMS';

async function ingestLabs() {
  console.log(`Starting complete laboratory ingestion from ${BASE_URL}...`);
  let totalDiscovered = 0;
  let newRecords = 0;
  let updatedRecords = 0;
  let duplicates = 0;
  let invalidRecords = 0;
  let failedRecords = 0;
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      console.log(`Fetching page ${page}...`);
      const response = await axios.get(`${BASE_URL}?page=${page}`);
      const $ = cheerio.load(response.data);
      const rows = $('#dataTable tbody tr');
      
      if (rows.length === 0) {
        hasMore = false;
        break;
      }
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cols = $(row).find('td');
        if (cols.length < 8) continue;

        totalDiscovered++;
        const labCode = $(cols[1]).text().trim();
        const nameFull = $(cols[2]).text().trim();
        const addressFull = $(cols[3]).text().trim().replace(/\s+/g, ' ');
        const contactPerson = $(cols[4]).text().trim();
        const phone = $(cols[5]).text().trim();
        const email = $(cols[6]).text().trim();
        const validityDate = $(cols[7]).text().trim();

        if (!labCode || !nameFull) {
          invalidRecords++;
          continue;
        }

        const addressParts = addressFull.split(',').map(s => s.trim());
        let state = '';
        if (addressParts.length >= 3) {
            let countryPartIndex = addressParts.findIndex(p => p.toLowerCase().includes('india'));
            if (countryPartIndex > 0) {
                state = addressParts[countryPartIndex - 1];
            }
        }

        const record = {
          labCode,
          name: nameFull,
          address: addressFull,
          state,
          contactPerson,
          phone,
          email,
          validityDate,
          status: 'Active',
          category: 'BIS Recognized Labs',
          sourceUrl: `${BASE_URL}?page=${page}`,
          sourceName: SOURCE_NAME,
          lastVerifiedAt: new Date()
        };

        try {
          const existing = await prisma.laboratory.findUnique({ where: { labCode } });
          if (existing) {
            await prisma.laboratory.update({ where: { labCode }, data: record });
            updatedRecords++;
            duplicates++;
          } else {
            await prisma.laboratory.create({ data: record });
            newRecords++;
          }
        } catch (e) {
          failedRecords++;
          console.error(`Failed to insert lab ${labCode}:`, e);
        }
      }
      page++;
    }

    console.log('\n--- Ingestion Report ---');
    console.log(`SOURCE: ${SOURCE_NAME}`);
    console.log(`Pages processed: ${page - 1}`);
    console.log(`Laboratories discovered: ${totalDiscovered}`);
    console.log(`New records: ${newRecords}`);
    console.log(`Updated records: ${updatedRecords}`);
    console.log(`Duplicate records: ${duplicates}`);
    console.log(`Invalid records: ${invalidRecords}`);
    console.log(`Failed records: ${failedRecords}`);

  } catch (error) {
    console.error('Ingestion failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ingestLabs();
