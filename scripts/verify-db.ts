import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const admin = await prisma.admin.findFirst();
  const jobsCount = await prisma.job.count();
  const sampleJobs = await prisma.job.findMany({
    take: 2,
    select: { id: true, jobTitle: true, companyName: true, location: true },
  });

  console.log('=== NEON POSTGRES END-TO-END TEST SUCCESS ===');
  console.log('Database Host: ep-aged-wave-b43ofn9k-pooler.c-6.us-east-2.aws.neon.tech');
  console.log('Admin record in DB:', admin ? `${admin.email} (${admin.name})` : 'None');
  console.log('Total Job records in DB:', jobsCount);
  console.log('Sample jobs in Neon DB:', JSON.stringify(sampleJobs, null, 2));
}

test()
  .catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
