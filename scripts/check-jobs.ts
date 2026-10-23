import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const fakeNovigo = await prisma.job.findMany({
    where: { companyName: { in: ['Novigo', 'TechCorp Global'] } },
  });
  const total = await prisma.job.count();
  const active = await prisma.job.count({ where: { status: 'ACTIVE' } });
  const sample = await prisma.job.findMany({
    where: { status: 'ACTIVE' },
    take: 10,
    select: { companyName: true, jobTitle: true },
  });

  console.log(`Fake jobs count: ${fakeNovigo.length}`);
  console.log(`Total jobs: ${total}`);
  console.log(`Active jobs: ${active}`);
  console.log('Sample Active:');
  console.log(JSON.stringify(sample, null, 2));
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
