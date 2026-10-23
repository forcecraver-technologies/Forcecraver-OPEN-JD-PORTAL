import * as fs from 'fs';
import * as path from 'path';

const backupDir = path.join(process.cwd(), 'backup_data');
const files = fs.readdirSync(backupDir).filter(f => f.startsWith('real_backup_'));
if (files.length > 0) {
  const content = JSON.parse(fs.readFileSync(path.join(backupDir, files[0]), 'utf8'));
  console.log('Old Database Total Jobs:', content.jobs.length);
  const activeJobs = content.jobs.filter((j: any) => j.status === 'ACTIVE');
  const closedJobs = content.jobs.filter((j: any) => j.status === 'CLOSED');
  console.log('Old Database Active Jobs:', activeJobs.length);
  console.log('Old Database Closed Jobs:', closedJobs.length);

  const companies: Record<string, number> = {};
  for (const j of activeJobs) {
    companies[j.companyName] = (companies[j.companyName] || 0) + 1;
  }
  console.log('Top companies with ACTIVE jobs:');
  console.log(companies);
}
