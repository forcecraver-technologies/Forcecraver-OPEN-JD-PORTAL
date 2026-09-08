'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import JobFilters from '@/components/JobFilters';
import JobCard from '@/components/JobCard';
import CompanyCard from '@/components/CompanyCard';
import Pagination from '@/components/Pagination';
import ExportModal from '@/components/admin/ExportModal';
import { Job, JobFilterParams, CompanyWithCount } from '@/types/job';
import {
  Briefcase,
  Building2,
  Search,
  RotateCcw,
  Sparkles,
  Filter,
  CheckCircle2,
  ChevronRight,
  LayoutGrid,
  Table2,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeCompanies, setActiveCompanies] = useState<CompanyWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedRule, setMatchedRule] = useState<string | null>(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // View mode toggle: 'grid' (Cards) or 'table' (Dashboard Directory)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Parse filters from URL
  const currentFilters: JobFilterParams = {
    search: searchParams.get('search') || undefined,
    company: searchParams.get('company') || undefined,
    title: searchParams.get('title') || undefined,
    skills: searchParams.get('skills') || undefined,
    experience: searchParams.get('experience') || undefined,
    location: searchParams.get('location') || undefined,
    status: (searchParams.get('status') as any) || 'ACTIVE',
    postedDate: (searchParams.get('postedDate') as any) || 'all',
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
    limit: 9,
  };

  // Fetch active companies for the "Companies with Active JDs" section
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch('/api/companies');
        if (res.ok) {
          const data = await res.json();
          setActiveCompanies(data.companies || []);
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
      }
    }
    loadCompanies();
  }, []);

  // Fetch filtered jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (currentFilters.search) params.set('search', currentFilters.search);
      if (currentFilters.company) params.set('company', currentFilters.company);
      if (currentFilters.title) params.set('title', currentFilters.title);
      if (currentFilters.skills) params.set('skills', currentFilters.skills);
      if (currentFilters.experience) params.set('experience', currentFilters.experience);
      if (currentFilters.location) params.set('location', currentFilters.location);
      if (currentFilters.status) params.set('status', currentFilters.status);
      if (currentFilters.postedDate && currentFilters.postedDate !== 'all') {
        params.set('postedDate', currentFilters.postedDate);
      }
      if (currentFilters.page) params.set('page', currentFilters.page.toString());
      params.set('limit', (currentFilters.limit || 9).toString());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setTotalJobs(data.pagination.total || 0);
        setTotalPages(data.pagination.totalPages || 1);
        setMatchedRule(data.matchedRule || null);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateUrlParams = (newFilters: JobFilterParams) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.company) params.set('company', newFilters.company);
    if (newFilters.title) params.set('title', newFilters.title);
    if (newFilters.skills) params.set('skills', newFilters.skills);
    if (newFilters.experience) params.set('experience', newFilters.experience);
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.status && newFilters.status !== 'ACTIVE') params.set('status', newFilters.status);
    if (newFilters.postedDate && newFilters.postedDate !== 'all') params.set('postedDate', newFilters.postedDate);
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString());

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/');
  };

  const handleSearch = (query: string) => {
    updateUrlParams({
      ...currentFilters,
      search: query || undefined,
      page: 1,
    });
  };

  const handleApplyFilters = (newFilters: JobFilterParams) => {
    updateUrlParams({
      ...newFilters,
      search: currentFilters.search,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    router.push('/');
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({
      ...currentFilters,
      page: newPage,
    });
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const availableCompanyNames = activeCompanies.map((c) => c.companyName);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Rule engine badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Deterministic Rule-Based Job Discovery
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Find <span className="text-blue-600">Active</span> Job Opportunities
          </h1>

          <p className="mt-4 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Search currently active job descriptions from multiple companies.
          </p>

          {/* Search Bar with Predefined Rules */}
          <div className="mt-8">
            <SearchBar
              initialQuery={currentFilters.search || ''}
              onSearch={handleSearch}
              matchedRule={matchedRule}
            />
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA: FILTERS + JOB RESULTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Dynamic Filter Sidebar */}
          <JobFilters
            filters={currentFilters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            availableCompanies={availableCompanyNames}
          />

          {/* Job Results Column */}
          <div className="flex-1 w-full min-w-0">
            {/* Header with count, view toggle & actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>Available Opportunities</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    {totalJobs}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing sorted by most recently posted first
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Export XLS button */}
                <button
                  type="button"
                  onClick={() => setExportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
                  title="Export active opportunities to Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export XLS</span>
                </button>

                {/* View Mode Switcher: Cards vs Table */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Table Directory Dashboard View"
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Grid Cards View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>
                </div>

                {(currentFilters.search || currentFilters.company || currentFilters.location) && (
                  <button
                    onClick={handleClearFilters}
                    type="button"
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Search
                  </button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 p-6 h-72 animate-pulse space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                    </div>
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="h-4 bg-slate-100 rounded"></div>
                      <div className="h-4 bg-slate-100 rounded"></div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <div className="h-6 bg-slate-100 rounded w-16"></div>
                      <div className="h-6 bg-slate-100 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <>
                {/* Switch between Table Dashboard View and Cards Grid View */}
                {viewMode === 'table' ? (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                            <th className="py-3.5 px-6">Company</th>
                            <th className="py-3.5 px-6">Job Title</th>
                            <th className="py-3.5 px-6">Location</th>
                            <th className="py-3.5 px-6">Posted Date</th>
                            <th className="py-3.5 px-6">Status</th>
                            <th className="py-3.5 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {jobs.map((job) => {
                            const dateStr = job.postedDate
                              ? format(new Date(job.postedDate), 'MMM dd, yyyy')
                              : '—';

                            return (
                              <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-4 px-6 font-semibold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span className="truncate">{job.companyName}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 font-medium text-slate-800">
                                  <Link
                                    href={`/jobs/${job.id}`}
                                    className="hover:text-blue-600 hover:underline font-semibold text-slate-900 block"
                                  >
                                    {job.jobTitle}
                                  </Link>
                                </td>
                                <td className="py-4 px-6 text-slate-600">
                                  {job.location || 'Remote'}
                                </td>
                                <td className="py-4 px-6 text-slate-600 text-xs">
                                  {dateStr}
                                </td>
                                <td className="py-4 px-6">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Active
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Link
                                      href={`/jobs/${job.id}`}
                                      title="View Job Details"
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Job Cards Grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <Pagination
                  currentPage={currentFilters.page || 1}
                  totalPages={totalPages}
                  totalItems={totalJobs}
                  itemsPerPage={currentFilters.limit || 9}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Jobs Found</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  No active job descriptions match your search and filter criteria. Try adjusting your keyword or clearing filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. COMPANIES WITH ACTIVE JDs SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-700/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Top Employers
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Companies with Active JDs
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Explore organizations actively hiring talent right now across technical disciplines.
              </p>
            </div>

            <Link
              href="/companies"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>View All Companies</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeCompanies.slice(0, 8).map((comp) => (
              <Link
                key={comp.companyName}
                href={`/companies/${encodeURIComponent(comp.companyName)}`}
                className="group bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 rounded-2xl p-5 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {comp.activeJobCount} {comp.activeJobCount === 1 ? 'Job' : 'Jobs'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {comp.companyName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {comp.activeJobCount} Active Opportunities
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Public Export XLS Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        totalJobs={totalJobs}
        totalPages={totalPages}
        currentPage={currentFilters.page || 1}
        itemsPerPage={currentFilters.limit || 9}
        apiEndpoint="/api/jobs/export"
        filters={{
          search: currentFilters.search,
          company: currentFilters.company,
          status: 'ACTIVE',
          postedDate: currentFilters.postedDate,
        }}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading Open JD Portal...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
