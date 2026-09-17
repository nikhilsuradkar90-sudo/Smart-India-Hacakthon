import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as https from 'https';

const prisma = new PrismaClient();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

async function runIngestion() {
  console.log("Starting complete standard ingestion from official BIS Angular SPA API...");
  
  try {
    const deptsResponse = await axios.post(
      "https://standardsadmin.bis.gov.in/project-service/getWebsiteTechnicalDepartments",
      {},
      { httpsAgent, headers: { 'Content-Type': 'application/json' } }
    );
    
    if (deptsResponse.data.status !== "SUCCESS") {
      throw new Error("Failed to fetch technical departments");
    }
    
    const departments = deptsResponse.data.data;
    console.log(`Discovered ${departments.length} Technical Departments (Groups).`);
    
    let totalStandardsDiscovered = 0;
    let totalUniqueStandards = 0;
    
    for (const dept of departments) {
      console.log(`\nProcessing Department: ${dept.deptName}`);
      let page = 1;
      let totalPages = 1;
      let deptStandardsCount = 0;
      
      while (page <= totalPages) {
        try {
          const standardsResponse = await axios.post(
            "https://standardsadmin.bis.gov.in/proposal-service/getWebsiteIndianStandardsList",
            { departmentId: dept.departmentId, page: page },
            { httpsAgent, headers: { 'Content-Type': 'application/json' } }
          );
          
          if (standardsResponse.data.status !== "SUCCESS") {
            console.error(`Failed to fetch page ${page} for department ${dept.deptName}`);
            break;
          }
          
          const records = standardsResponse.data.data || [];
          const totalRecords = standardsResponse.data.totalRecord || 0;
          
          if (page === 1) {
             totalPages = Math.ceil(totalRecords / 20);
             console.log(`  Total expected records: ${totalRecords} (Pages: ${totalPages})`);
             if (totalPages === 0) break;
          }
          
          process.stdout.write(`  Fetching page ${page}/${totalPages}... `);
          
          // Process records
          let processed = 0;
          for (const raw of records) {
             // 1. Group
             const groupName = raw.departmentName || dept.deptName;
             const group = await prisma.group.upsert({
                 where: { name: groupName },
                 update: {},
                 create: { name: groupName }
             });
             
             // 2. SubGroup
             let subGroup = null;
             if (raw.sectionalCommitteeName) {
                 subGroup = await prisma.subGroup.upsert({
                     where: { groupId_name: { groupId: group.id, name: raw.sectionalCommitteeName } },
                     update: {},
                     create: { groupId: group.id, name: raw.sectionalCommitteeName }
                 });
             }
             
             // 3. Standard
             const isNumber = raw.standardNumber;
             const publicationYear = raw.publishedOn ? parseInt(raw.publishedOn.substring(0,4)) : null;
             
             const standard = await prisma.standard.upsert({
                 where: { isNumber: isNumber },
                 update: {
                     title: raw.standardName,
                     status: "Published",
                     technicalDepartment: groupName,
                     sectionalCommittee: raw.sectionalCommitteeName,
                     publicationYear: publicationYear,
                     lastVerifiedAt: new Date()
                 },
                 create: {
                     isNumber: isNumber,
                     title: raw.standardName,
                     status: "Published",
                     technicalDepartment: groupName,
                     sectionalCommittee: raw.sectionalCommitteeName,
                     publicationYear: publicationYear,
                     sourceName: "BIS",
                     sourceUrl: "https://standards.bis.gov.in/website/published-standards/published-standard-deptwise",
                     lastVerifiedAt: new Date()
                 }
             });
             
             // 4. Link Group
             await prisma.standardGroup.upsert({
                 where: { standardId_groupId: { standardId: standard.id, groupId: group.id } },
                 update: {},
                 create: { standardId: standard.id, groupId: group.id }
             });
             
             // 5. Link SubGroup
             if (subGroup) {
                 await prisma.standardSubGroup.upsert({
                     where: { standardId_subGroupId: { standardId: standard.id, subGroupId: subGroup.id } },
                     update: {},
                     create: { standardId: standard.id, subGroupId: subGroup.id }
                 });
             }
             
             processed++;
             totalStandardsDiscovered++;
          }
          
          console.log(`Processed ${processed} records.`);
          deptStandardsCount += processed;
          page++;
          
        } catch (err) {
          console.error(`  Error fetching page ${page}:`, err.message);
          // Wait a bit and retry maybe? Let's just break for now or continue
          break;
        }
      }
      console.log(`Finished Department: ${dept.deptName}. Ingested ${deptStandardsCount} records.`);
    }
    
    const dbTotal = await prisma.standard.count();
    const grpTotal = await prisma.group.count();
    const subGrpTotal = await prisma.subGroup.count();
    
    console.log(`\n--- Ingestion Report ---`);
    console.log(`SOURCE: BIS Angular SPA`);
    console.log(`Raw records discovered: ${totalStandardsDiscovered}`);
    console.log(`Database standards: ${dbTotal}`);
    console.log(`Groups discovered: ${grpTotal}`);
    console.log(`Sub-groups discovered: ${subGrpTotal}`);
    
  } catch (err) {
    console.error("Ingestion failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runIngestion();
