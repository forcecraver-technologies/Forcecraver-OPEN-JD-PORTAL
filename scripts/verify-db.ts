import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const admin = await prisma.admin.findFirst();
  const total = await prisma.job.count();
  const active = await prisma.job.count({ where: { status: 'ACTIVE' } });
  const closed = await prisma.job.count({ where: { status: 'CLOSED' } });
  const sampleJobs = await prisma.job.findMany({
    take: 3,
    select: { id: true, jobTitle: true, companyName: true, location: true, status: true },
  });

  console.log('=== VERIFICATION OF REAL DATA IN NEW NEON DB ===');
  console.log(`Admin in DB: ${admin?.email} (${admin?.name})`);
  console.log(`Total Jobs: ${total}`);
  console.log(`Active Jobs: ${active}`);
  console.log(`Closed Jobs: ${closed}`);
  console.log('Sample Real Jobs:');
  console.log(JSON.stringify(sampleJobs, null, 2));
}

test()
  .catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
