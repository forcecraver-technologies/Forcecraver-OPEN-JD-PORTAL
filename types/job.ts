export type JobStatus = 'ACTIVE' | 'CLOSED';

export interface Job {
  id: string;
  companyName: string;
  contactPerson?: string | null;
  jobTitle: string;
  skills: string | null;
  experience: string | null;
  location: string | null;
  salaryBudget: string | null;
  jobDescription: string;
  postedDate: string | Date;
  status: JobStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface JobFilterParams {
  search?: string;
  company?: string;
  title?: string;
  skills?: string;
  experience?: string;
  location?: string;
  status?: JobStatus | 'ALL';
  postedDate?: 'today' | '7days' | '30days' | 'all';
  page?: number;
  limit?: number;
}

export interface PaginatedJobsResponse {
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  matchedRule?: string | null;
}

export interface CompanyWithCount {
  companyName: string;
  activeJobCount: number;
  contactPerson?: string | null;
  latestPostedDate?: string | Date;
  totalCount?: number;
}

export interface AdminStats {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalCompanies: number;
  recentJobs: Job[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}
