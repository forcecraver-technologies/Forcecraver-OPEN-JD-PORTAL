import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const OLD_DB_URL = "postgresql://neondb_owner:npg_Pg0E4YesWBjF@ep-royal-truth-ay7qclcz-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const NEW_DB_URL = "postgresql://neondb_owner:npg_l4GpiBSkbzh5@ep-aged-wave-b43ofn9k-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function migrate() {
  console.log('--- STEP 1: CONNECTING TO OLD DATABASE ---');
  const oldPrisma = new PrismaClient({
    datasources: {
      db: { url: OLD_DB_URL },
    },
  });

  const [oldAdmins, oldJobs, oldCandidates, oldInterviews] = await Promise.all([
    oldPrisma.admin.findMany(),
    oldPrisma.job.findMany(),
    oldPrisma.candidate.findMany(),
    oldPrisma.interview.findMany(),
  ]);

  console.log(`[OLD DB] Fetched:`);
  console.log(`- Admins: ${oldAdmins.length}`);
  console.log(`- Jobs: ${oldJobs.length}`);
  console.log(`- Candidates: ${oldCandidates.length}`);
  console.log(`- Interviews: ${oldInterviews.length}`);

  // Save local backup file
  const backupDir = path.join(process.cwd(), 'backup_data');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `real_backup_${timestamp}.json`);
  fs.writeFileSync(
    backupFile,
    JSON.stringify(
      {
        timestamp,
        counts: {
          admins: oldAdmins.length,
          jobs: oldJobs.length,
          candidates: oldCandidates.length,
          interviews: oldInterviews.length,
        },
        admins: oldAdmins,
        jobs: oldJobs,
        candidates: oldCandidates,
        interviews: oldInterviews,
      },
      null,
      2
    )
  );
  console.log(`[BACKUP] Saved real database backup to: ${backupFile}`);

  await oldPrisma.$disconnect();

  console.log('\n--- STEP 2: CONNECTING TO NEW DATABASE ---');
  const newPrisma = new PrismaClient({
    datasources: {
      db: { url: NEW_DB_URL },
    },
  });

  console.log('[NEW DB] Cleaning fake/sample data...');
  // Delete in reverse order of foreign key dependencies
  await newPrisma.interview.deleteMany({});
  await newPrisma.job.deleteMany({});
  await newPrisma.candidate.deleteMany({});
  await newPrisma.admin.deleteMany({});
  console.log('[NEW DB] Cleaned sample data.');

  console.log('\n--- STEP 3: MIGRATING REAL DATA TO NEW DATABASE ---');

  // 1. Admins
  if (oldAdmins.length > 0) {
    console.log(`Migrating ${oldAdmins.length} admins...`);
    for (const admin of oldAdmins) {
      await newPrisma.admin.create({
        data: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          passwordHash: admin.passwordHash,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        },
      });
    }
  }

  // 2. Jobs
  if (oldJobs.length > 0) {
    console.log(`Migrating ${oldJobs.length} jobs...`);
    for (const job of oldJobs) {
      await newPrisma.job.create({
        data: {
          id: job.id,
          companyName: job.companyName,
          contactPerson: job.contactPerson,
          jobTitle: job.jobTitle,
          skills: job.skills,
          experience: job.experience,
          location: job.location,
          salaryBudget: job.salaryBudget,
          jobDescription: job.jobDescription,
          postedDate: job.postedDate,
          status: job.status,
          uan: job.uan,
          notes: job.notes,
          shiftTiming: job.shiftTiming,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        },
      });
    }
  }

  // 3. Candidates
  if (oldCandidates.length > 0) {
    console.log(`Migrating ${oldCandidates.length} candidates...`);
    for (const candidate of oldCandidates) {
      await newPrisma.candidate.create({
        data: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          experience: candidate.experience,
          location: candidate.location,
          currentRole: candidate.currentRole,
          currentCtc: candidate.currentCtc,
          expectedCtc: candidate.expectedCtc,
          noticePeriod: candidate.noticePeriod,
          resumeUrl: candidate.resumeUrl,
          skills: candidate.skills,
          notes: candidate.notes,
          createdAt: candidate.createdAt,
          updatedAt: candidate.updatedAt,
        },
      });
    }
  }

  // 4. Interviews
  if (oldInterviews.length > 0) {
    console.log(`Migrating ${oldInterviews.length} interviews...`);
    for (const interview of oldInterviews) {
      await newPrisma.interview.create({
        data: {
          id: interview.id,
          referenceCode: interview.referenceCode,
          jobId: interview.jobId,
          candidateId: interview.candidateId,
          companyName: interview.companyName,
          jobTitle: interview.jobTitle,
          recruiterCompany: interview.recruiterCompany,
          recruiterCandidate: interview.recruiterCandidate,
          interviewDate: interview.interviewDate,
          startTime: interview.startTime,
          endTime: interview.endTime,
          timezone: interview.timezone,
          roundNumber: interview.roundNumber,
          roundName: interview.roundName,
          mode: interview.mode,
          meetingLink: interview.meetingLink,
          locationAddress: interview.locationAddress,
          interviewerName: interview.interviewerName,
          interviewerRole: interview.interviewerRole,
          interviewerEmail: interview.interviewerEmail,
          status: interview.status,
          rating: interview.rating,
          feedback: interview.feedback,
          adminNotes: interview.adminNotes,
          cancellationReason: interview.cancellationReason,
          l1Questions: interview.l1Questions,
          l2Questions: interview.l2Questions,
          l3Questions: interview.l3Questions,
          l4Questions: interview.l4Questions,
          l5Questions: interview.l5Questions,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt,
        },
      });
    }
  }

  console.log('\n--- STEP 4: VERIFYING NEW DATABASE ---');
  const [newAdminsCount, newJobsCount, newCandidatesCount, newInterviewsCount] = await Promise.all([
    newPrisma.admin.count(),
    newPrisma.job.count(),
    newPrisma.candidate.count(),
    newPrisma.interview.count(),
  ]);

  console.log(`[NEW DB FINAL COUNTS]`);
  console.log(`- Admins: ${newAdminsCount}`);
  console.log(`- Jobs: ${newJobsCount}`);
  console.log(`- Candidates: ${newCandidatesCount}`);
  console.log(`- Interviews: ${newInterviewsCount}`);

  await newPrisma.$disconnect();
  console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
