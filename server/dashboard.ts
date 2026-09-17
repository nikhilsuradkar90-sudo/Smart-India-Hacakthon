import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getDashboard(sessionId: string) {
  // Ensure user exists
  let user = await prisma.user.findUnique({
    where: { sessionId }
  });

  if (!user) {
    user = await prisma.user.create({
      data: { sessionId }
    });
  }

  const savedStandards = await prisma.savedStandard.findMany({
    where: { userId: user.id },
    include: { standard: true }
  });

  const savedCerts = await prisma.savedCertification.findMany({
    where: { userId: user.id },
    include: { scheme: true }
  });

  const activities = await prisma.userActivity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // Recommended Standards (just grab random for demo, but we should use AI. Since it's Phase 5, we can grab based on saved standards)
  let recommendations: any[] = [];
  if (savedStandards.length > 0) {
    const stdId = savedStandards[0].standardId;
    // Find standards in same group
    const groups = await prisma.standardGroup.findMany({ where: { standardId: stdId }});
    if (groups.length > 0) {
      const recs = await prisma.standardGroup.findMany({
        where: { groupId: groups[0].groupId, standardId: { not: stdId } },
        include: { standard: true },
        take: 3
      });
      recommendations = recs.map(r => r.standard);
    }
  } else {
    // Generic
    recommendations = await prisma.standard.findMany({ take: 3 });
  }

  return {
    savedStandards,
    savedCerts,
    activities,
    recommendations
  };
}

export async function logActivity(sessionId: string, activityType: string, entityId?: string, details?: string) {
  let user = await prisma.user.findUnique({ where: { sessionId } });
  if (!user) user = await prisma.user.create({ data: { sessionId } });

  return prisma.userActivity.create({
    data: {
      userId: user.id,
      activityType,
      entityId,
      details
    }
  });
}

export async function toggleSavedStandard(sessionId: string, standardId: string) {
  let user = await prisma.user.findUnique({ where: { sessionId } });
  if (!user) user = await prisma.user.create({ data: { sessionId } });

  const existing = await prisma.savedStandard.findUnique({
    where: { userId_standardId: { userId: user.id, standardId } }
  });

  if (existing) {
    await prisma.savedStandard.delete({ where: { id: existing.id } });
    return { saved: false };
  } else {
    await prisma.savedStandard.create({ data: { userId: user.id, standardId } });
    return { saved: true };
  }
}

export async function getNotifications(sessionId: string) {
  let user = await prisma.user.findUnique({ where: { sessionId } });
  if (!user) user = await prisma.user.create({ data: { sessionId } });

  // Let's check if they have any saved standards. 
  // We'll simulate a 10% chance of a "new amendment" for one of their saved standards for demo purposes.
  const saved = await prisma.savedStandard.findMany({ where: { userId: user.id }, include: { standard: true }});
  
  if (saved.length > 0 && Math.random() < 0.2) {
    const randomSaved = saved[Math.floor(Math.random() * saved.length)];
    return [{
      type: 'info',
      title: 'Standard Update',
      message: `A new amendment has been proposed for ${randomSaved.standard.isNumber}: ${randomSaved.standard.title}`,
    }];
  }
  return [];
}
