import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting certification data ingestion...');

  // 1. Create Scheme-I
  const scheme1 = await prisma.certificationScheme.create({
    data: {
      name: 'Scheme-I (ISI Mark Scheme)',
      description: 'The normal product certification scheme of BIS that grants the license to use the standard mark (ISI mark). It usually involves factory inspection and independent testing of samples.',
      requirements: {
        create: [
          {
            title: 'In-House Testing Facility',
            description: 'Manufacturer must establish an in-house laboratory with complete testing equipment as per the Scheme of Testing and Inspection (STI).',
            requirementType: 'Infrastructure',
            order: 1
          },
          {
            title: 'Application Submission',
            description: 'Apply via Manakonline portal with required documents, test reports (if any), and application fee.',
            requirementType: 'Application',
            order: 2
          },
          {
            title: 'Factory Inspection',
            description: 'A BIS official will visit the manufacturing premises to verify manufacturing infrastructure, quality control processes, and testing capabilities.',
            requirementType: 'Inspection',
            order: 3
          },
          {
            title: 'Sample Testing',
            description: 'Samples drawn during factory inspection must be sent to BIS recognized laboratories for independent conformity testing.',
            requirementType: 'Testing',
            order: 4
          }
        ]
      }
    }
  });
  console.log('Created Scheme-I');

  // 2. Create Compulsory Registration Scheme (CRS)
  const crsScheme = await prisma.certificationScheme.create({
    data: {
      name: 'Scheme-II (Compulsory Registration Scheme - CRS)',
      description: 'Under CRS, manufacturers are required to self-declare conformity to Indian Standards and obtain registration before launching products in the market.',
      requirements: {
        create: [
          {
            title: 'Product Testing',
            description: 'Get the product tested at a BIS recognized laboratory as per the applicable IS.',
            requirementType: 'Testing',
            order: 1
          },
          {
            title: 'Online Application',
            description: 'Submit an online application on the CRS portal with the test report within 90 days of issue.',
            requirementType: 'Application',
            order: 2
          },
          {
            title: 'Scrutiny and Grant',
            description: 'BIS scrutinizes the application and test reports. If satisfactory, registration is granted.',
            requirementType: 'Registration',
            order: 3
          }
        ]
      }
    }
  });
  console.log('Created CRS Scheme');

  // Find standards
  const is14543 = await prisma.standard.findUnique({ where: { isNumber: 'IS 14543' } });
  const is9873 = await prisma.standard.findUnique({ where: { isNumber: 'IS 9873-1' } });
  const is13252 = await prisma.standard.findUnique({ where: { isNumber: 'IS 13252' } });
  
  // 3. Create Products
  if (is14543) {
    await prisma.product.create({
      data: {
        name: 'Packaged Drinking Water (Other than Natural Mineral Water)',
        category: 'Food and Agriculture',
        schemeId: scheme1.id,
        standardId: is14543.id
      }
    });
    console.log('Linked Packaged Drinking Water to Scheme-I');
  }

  if (is9873) {
    await prisma.product.create({
      data: {
        name: 'Safety of Toys - Part 1: Safety Aspects Related to Mechanical and Physical Properties',
        category: 'Consumer Products',
        schemeId: scheme1.id,
        standardId: is9873.id
      }
    });
    console.log('Linked Toys to Scheme-I');
  }

  if (is13252) {
    await prisma.product.create({
      data: {
        name: 'Information Technology Equipment - Safety',
        category: 'Electronics and IT',
        schemeId: crsScheme.id,
        standardId: is13252.id
      }
    });
    console.log('Linked IT Equipment to CRS Scheme');
  }

  // Create additional products without standard links to demonstrate search breadth
  await prisma.product.create({
    data: {
      name: 'Ordinary Portland Cement',
      category: 'Civil Engineering',
      schemeId: scheme1.id
    }
  });
  
  await prisma.product.create({
    data: {
      name: 'Structural Steel',
      category: 'Metallurgical',
      schemeId: scheme1.id
    }
  });

  console.log('Ingestion complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
