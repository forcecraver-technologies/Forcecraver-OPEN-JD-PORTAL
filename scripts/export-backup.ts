import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportData() {
  const backupDir = path.join(process.cwd(), 'backup_data');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('Fetching database records...');
  const admins = await prisma.admin.findMany();
  const jobs = await prisma.job.findMany();
  const candidates = await prisma.candidate.findMany();
  const interviews = await prisma.interview.findMany();

  const backupData = {
    exportDate: new Date().toISOString(),
    counts: {
      admins: admins.length,
      jobs: jobs.length,
      candidates: candidates.length,
      interviews: interviews.length,
    },
    admins,
    jobs,
    candidates,
    interviews,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(backupDir, `database_backup_${timestamp}.json`);
  fs.writeFileSync(filename, JSON.stringify(backupData, null, 2));

  // Also write individual json files for easy import
  fs.writeFileSync(path.join(backupDir, 'admins.json'), JSON.stringify(admins, null, 2));
  fs.writeFileSync(path.join(backupDir, 'jobs.json'), JSON.stringify(jobs, null, 2));
  fs.writeFileSync(path.join(backupDir, 'candidates.json'), JSON.stringify(candidates, null, 2));
  fs.writeFileSync(path.join(backupDir, 'interviews.json'), JSON.stringify(interviews, null, 2));

  console.log('--- BACKUP COMPLETED SUCCESSFULLY ---');
  console.log(`Saved full backup to: ${filename}`);
  console.log(`Admins: ${admins.length}`);
  console.log(`Jobs: ${jobs.length}`);
  console.log(`Candidates: ${candidates.length}`);
  console.log(`Interviews: ${interviews.length}`);
}

exportData()
  .catch((e) => {
    console.error('Error exporting data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
