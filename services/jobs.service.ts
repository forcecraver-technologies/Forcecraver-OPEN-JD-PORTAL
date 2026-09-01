import prisma from '@/lib/prisma';
import { JobFilterParams, PaginatedJobsResponse, CompanyWithCount, AdminStats } from '@/types/job';
import { buildJobWhereClause } from '@/lib/searchRules';
import { JobStatus, Job } from '@prisma/client';
import { JobInput } from '@/lib/validations';

export class JobsService {
  /**
   * Search and filter jobs with pagination and rule matching
   */
  static async getJobs(params: JobFilterParams): Promise<PaginatedJobsResponse> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const { where, matchedRule } = buildJobWhereClause(params);

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy: [
          { postedDate: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
      matchedRule,
    };
  }

  /**
   * Fetch a single job by its ID
   */
  static async getJobById(id: string): Promise<Job | null> {
    return await prisma.job.findUnique({
      where: { id },
    });
  }

  /**
   * Fetch companies that have at least one active job with count and handler
   */
  static async getActiveCompanies(): Promise<CompanyWithCount[]> {
    const allJobs = await prisma.job.findMany({
      select: {
        companyName: true,
        contactPerson: true,
        status: true,
        postedDate: true,
      },
      orderBy: {
        postedDate: 'desc',
      },
    });

    const companyMap = new Map<
      string,
      { activeJobCount: number; totalCount: number; contactPerson: string | null; latestPostedDate: Date }
    >();

    for (const job of allJobs) {
      const existing = companyMap.get(job.companyName) || {
        activeJobCount: 0,
        totalCount: 0,
        contactPerson: null,
        latestPostedDate: job.postedDate,
      };

      existing.totalCount++;
      if (job.status === JobStatus.ACTIVE) {
        existing.activeJobCount++;
      }

      if (!existing.contactPerson && job.contactPerson) {
        existing.contactPerson = job.contactPerson;
      }

      companyMap.set(job.companyName, existing);
    }

    return Array.from(companyMap.entries())
      .filter(([_, stats]) => stats.activeJobCount > 0)
      .map(([companyName, stats]) => ({
        companyName,
        activeJobCount: stats.activeJobCount,
        totalCount: stats.totalCount,
        contactPerson: stats.contactPerson,
        latestPostedDate: stats.latestPostedDate,
      }))
      .sort((a, b) => b.activeJobCount - a.activeJobCount);
  }

  /**
   * Admin: Get all companies with Total, Active, Closed counts and Handled By / Contact Person
   */
  static async getAdminCompaniesWithStats(): Promise<
    Array<{
      companyName: string;
      contactPerson: string | null;
      totalCount: number;
      activeCount: number;
      closedCount: number;
      latestPostedDate: Date;
    }>
  > {
    const allJobs = await prisma.job.findMany({
      select: {
        companyName: true,
        contactPerson: true,
        status: true,
        postedDate: true,
      },
      orderBy: {
        postedDate: 'desc',
      },
    });

    const companyMap = new Map<
      string,
      { contactPerson: string | null; totalCount: number; activeCount: number; closedCount: number; latestPostedDate: Date }
    >();

    for (const job of allJobs) {
      const existing = companyMap.get(job.companyName) || {
        contactPerson: null,
        totalCount: 0,
        activeCount: 0,
        closedCount: 0,
        latestPostedDate: job.postedDate,
      };

      if (!existing.contactPerson && job.contactPerson) {
        existing.contactPerson = job.contactPerson;
      }

      existing.totalCount++;
      if (job.status === JobStatus.ACTIVE) {
        existing.activeCount++;
      } else {
        existing.closedCount++;
      }
      companyMap.set(job.companyName, existing);
    }

    return Array.from(companyMap.entries())
      .map(([companyName, stats]) => ({
        companyName,
        ...stats,
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
  }

  /**
   * Admin: Update contact person / handler for all jobs of a company
   */
  static async updateCompanyHandler(companyName: string, contactPerson: string): Promise<{ count: number }> {
    return await prisma.job.updateMany({
      where: {
        companyName: {
          equals: companyName,
          mode: 'insensitive',
        },
      },
      data: {
        contactPerson: contactPerson.trim() || null,
      },
    });
  }

  /**
   * Get active jobs for a specific company
   */
  static async getJobsByCompany(companyName: string, includeClosed = false): Promise<Job[]> {
    return await prisma.job.findMany({
      where: {
        companyName: {
          equals: companyName,
          mode: 'insensitive',
        },
        ...(includeClosed ? {} : { status: JobStatus.ACTIVE }),
      },
      orderBy: [
        { postedDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Admin: Create a new job description
   */
  static async createJob(data: JobInput): Promise<Job> {
    return await prisma.job.create({
      data: {
        companyName: data.companyName.trim(),
        contactPerson: data.contactPerson?.trim() || null,
        jobTitle: data.jobTitle.trim(),
        skills: data.skills?.trim() || null,
        experience: data.experience?.trim() || null,
        location: data.location?.trim() || null,
        salaryBudget: data.salaryBudget?.trim() || null,
        jobDescription: data.jobDescription.trim(),
        postedDate: new Date(data.postedDate),
        status: data.status as JobStatus,
      },
    });
  }

  /**
   * Admin: Update an existing job description
   */
  static async updateJob(id: string, data: Partial<JobInput>): Promise<Job> {
    const updateData: Record<string, unknown> = {};

    if (data.companyName !== undefined) updateData.companyName = data.companyName.trim();
    if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson?.trim() || null;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle.trim();
    if (data.skills !== undefined) updateData.skills = data.skills?.trim() || null;
    if (data.experience !== undefined) updateData.experience = data.experience?.trim() || null;
    if (data.location !== undefined) updateData.location = data.location?.trim() || null;
    if (data.salaryBudget !== undefined) updateData.salaryBudget = data.salaryBudget?.trim() || null;
    if (data.jobDescription !== undefined) updateData.jobDescription = data.jobDescription.trim();
    if (data.postedDate !== undefined) updateData.postedDate = new Date(data.postedDate);
    if (data.status !== undefined) updateData.status = data.status as JobStatus;

    return await prisma.job.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Admin: Delete a job description
   */
  static async deleteJob(id: string): Promise<Job> {
    return await prisma.job.delete({
      where: { id },
    });
  }

  /**
   * Admin: Toggle or set status of a job
   */
  static async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    return await prisma.job.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Admin: Bulk update status of multiple jobs
   */
  static async updateBulkStatus(ids: string[], status: JobStatus): Promise<{ count: number }> {
    return await prisma.job.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status },
    });
  }

  /**
   * Admin: Bulk delete multiple jobs
   */
  static async deleteBulkJobs(ids: string[]): Promise<{ count: number }> {
    return await prisma.job.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  /**
   * Admin: Get dashboard overview KPIs and recent jobs
   */
  static async getAdminStats(): Promise<AdminStats> {
    const [totalJobs, activeJobs, closedJobs, companiesGrouped, recentJobs] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: JobStatus.ACTIVE } }),
      prisma.job.count({ where: { status: JobStatus.CLOSED } }),
      prisma.job.groupBy({ by: ['companyName'] }),
      prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    return {
      totalJobs,
      activeJobs,
      closedJobs,
      totalCompanies: companiesGrouped.length,
      recentJobs,
    };
  }
}
