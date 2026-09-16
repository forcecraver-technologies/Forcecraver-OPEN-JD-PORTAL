export type JobStatus = 'ACTIVE' | 'CLOSED';

export interface ScheduledCandidate {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  experience?: string | null;
  location?: string | null;
  currentRole?: string | null;
}

export interface ScheduledInterviewSummary {
  id: string;
  referenceCode: string;
  status: string;
  interviewDate: string | Date;
  startTime: string;
  endTime: string;
  roundName: string;
  mode: string;
  meetingLink?: string | null;
  candidate: ScheduledCandidate;
}

export interface Job {
  id: string;
  companyName: string;
  contactPerson?: string | null;
  jobTitle: string;
  skills: string | null;
  experience: string | null;
  location: string | null;
  salaryBudget: string | null;
  jobDescription?: string;
  postedDate: string | Date;
  status: JobStatus;
  uan?: string | null;
  notes?: string | null;
  shiftTiming?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  interviews?: ScheduledInterviewSummary[];
}

export interface JobFilterParams {
  search?: string;
  company?: string;
  title?: string;
  skills?: string;
  experience?: string;
  location?: string;
  status?: JobStatus | 'ALL';
  uan?: string;
  shiftTiming?: string;
  postedDate?: 'today' | '7days' | '30days' | 'all';
  startDate?: string;
  endDate?: string;
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

export interface CompanyJobSummary {
  id: string;
  jobTitle: string;
  status: JobStatus;
  location?: string | null;
  postedDate: string | Date;
  experience?: string | null;
  salaryBudget?: string | null;
}

export interface CompanyWithCount {
  companyName: string;
  activeJobCount: number;
  contactPerson?: string | null;
  latestPostedDate?: string | Date;
  totalCount?: number;
  jobs?: CompanyJobSummary[];
}

export interface CompanyAdminStats {
  companyName: string;
  contactPerson: string | null;
  totalCount: number;
  activeCount: number;
  closedCount: number;
  latestPostedDate: string | Date;
  jobs: CompanyJobSummary[];
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
