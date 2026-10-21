import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importData() {
  const backupDir = path.join(process.cwd(), 'backup_data');
  const files = fs.readdirSync(backupDir).filter(f => f.startsWith('database_backup_') && f.endsWith('.json'));

  if (files.length === 0) {
    console.error('No backup file found in backup_data directory!');
    process.exit(1);
  }

  // Pick the latest backup file
  files.sort().reverse();
  const latestBackup = path.join(backupDir, files[0]);
  console.log(`Importing from: ${latestBackup}`);

  const rawData = fs.readFileSync(latestBackup, 'utf-8');
  const data = JSON.parse(rawData);

  console.log(`Found:`);
  console.log(`- Admins: ${data.admins?.length || 0}`);
  console.log(`- Jobs: ${data.jobs?.length || 0}`);
  console.log(`- Candidates: ${data.candidates?.length || 0}`);
  console.log(`- Interviews: ${data.interviews?.length || 0}`);

  // 1. Admins
  if (data.admins && data.admins.length > 0) {
    console.log('Restoring admins...');
    for (const admin of data.admins) {
      await prisma.admin.upsert({
        where: { email: admin.email },
        update: {
          name: admin.name,
          passwordHash: admin.passwordHash,
        },
        create: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          passwordHash: admin.passwordHash,
          createdAt: new Date(admin.createdAt),
          updatedAt: new Date(admin.updatedAt),
        },
      });
    }
  }

  // 2. Jobs
  if (data.jobs && data.jobs.length > 0) {
    console.log('Restoring jobs...');
    for (const job of data.jobs) {
      await prisma.job.upsert({
        where: { id: job.id },
        update: {},
        create: {
          ...job,
          postedDate: new Date(job.postedDate),
          createdAt: new Date(job.createdAt),
          updatedAt: new Date(job.updatedAt),
        },
      });
    }
  }

  // 3. Candidates
  if (data.candidates && data.candidates.length > 0) {
    console.log('Restoring candidates...');
    for (const candidate of data.candidates) {
      await prisma.candidate.upsert({
        where: { id: candidate.id },
        update: {},
        create: {
          ...candidate,
          createdAt: new Date(candidate.createdAt),
          updatedAt: new Date(candidate.updatedAt),
        },
      });
    }
  }

  // 4. Interviews
  if (data.interviews && data.interviews.length > 0) {
    console.log('Restoring interviews...');
    for (const interview of data.interviews) {
      await prisma.interview.upsert({
        where: { id: interview.id },
        update: {},
        create: {
          ...interview,
          interviewDate: new Date(interview.interviewDate),
          createdAt: new Date(interview.createdAt),
          updatedAt: new Date(interview.updatedAt),
        },
      });
    }
  }

  console.log('--- RESTORE/IMPORT COMPLETED SUCCESSFULLY ---');
}

importData()
  .catch((e) => {
    console.error('Error importing data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
