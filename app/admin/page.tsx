'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import ExportModal from '@/components/admin/ExportModal';
import Pagination from '@/components/Pagination';
import NotesModal from '@/components/NotesModal';
import { AdminStats, Job } from '@/types/job';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Building2,
  PlusCircle,
  ArrowRight,
  Edit,
  Calendar,
  ExternalLink,
  Search,
  RotateCcw,
  FileSpreadsheet,
  Filter,
  ShieldCheck,
  StickyNote,
  Clock,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatShiftShort } from '@/lib/formatters';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Dynamic Jobs list state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [uanFilter, setUanFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Debounce search query (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Available companies for filter dropdown
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);

  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Notes Modal state
  const [selectedNotesJob, setSelectedNotesJob] = useState<Job | null>(null);

  // Load KPI overview stats and company list
  useEffect(() => {
    async function loadStatsAndCompanies() {
      try {
        setLoadingStats(true);
        const [statsRes, companiesRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/companies'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          const names = (companiesData.companies || []).map((c: any) => c.companyName);
          setAvailableCompanies(names);
        }
      } catch (err) {
        console.error('Failed to load admin stats or companies:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStatsAndCompanies();
  }, []);

  // Fetch jobs dynamically based on filters
  const fetchDashboardJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (companyFilter) params.set('company', companyFilter);
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
      if (uanFilter && uanFilter !== 'ALL') params.set('uan', uanFilter);
      if (shiftFilter && shiftFilter !== 'ALL') params.set('shiftTiming', shiftFilter);
      if (dateFilter && dateFilter !== 'all' && dateFilter !== 'custom') {
        params.set('postedDate', dateFilter);
      }
      if (dateFilter === 'custom') {
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
      }
      params.set('page', currentPage.toString());
      params.set('limit', '10');

      const res = await fetch(`/api/admin/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setTotalJobs(data.pagination.total || 0);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load dashboard jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  }, [debouncedSearch, companyFilter, statusFilter, uanFilter, shiftFilter, dateFilter, startDate, endDate, currentPage]);

  useEffect(() => {
    fetchDashboardJobs();
  }, [fetchDashboardJobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setDebouncedSearch(searchQuery);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setCompanyFilter('');
    setStatusFilter('ALL');
    setUanFilter('ALL');
    setShiftFilter('ALL');
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    companyFilter ||
    statusFilter !== 'ALL' ||
    uanFilter !== 'ALL' ||
    shiftFilter !== 'ALL' ||
    dateFilter !== 'all' ||
    startDate ||
    endDate
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Overview & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time PostgreSQL metrics and management shortcuts for job postings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Download XLS Button in Welcome Banner */}
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
            title="Download entries to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download XLS</span>
          </button>

          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New JD</span>
          </Link>

          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-all"
          >
            <Briefcase className="w-4 h-4" />
            <span>Manage All JDs</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="Total JDs"
          value={loadingStats ? '...' : stats?.totalJobs || 0}
          icon={Briefcase}
          color="blue"
          subtext="Total posted descriptions"
        />
        <AdminStatsCard
          title="Active JDs"
          value={loadingStats ? '...' : stats?.activeJobs || 0}
          icon={CheckCircle2}
          color="emerald"
          subtext="Publicly discoverable"
        />
        <AdminStatsCard
          title="Closed JDs"
          value={loadingStats ? '...' : stats?.closedJobs || 0}
          icon={XCircle}
          color="slate"
          subtext="Archived or filled"
        />
        <AdminStatsCard
          title="Hiring Companies"
          value={loadingStats ? '...' : stats?.totalCompanies || 0}
          icon={Building2}
          color="purple"
          subtext="Distinct organizations"
        />
      </div>

      {/* Filterable Job Postings Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        {/* Section Header */}
        <div className="p-6 pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>Job Postings Directory</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                {totalJobs} {totalJobs === 1 ? 'Entry' : 'Entries'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter by company, date range, or status & export to Excel
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-xs font-bold rounded-xl transition-all shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export XLS</span>
            </button>

            <Link
              href="/admin/jobs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline ml-2"
            >
              <span>Manage Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="px-6 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, skills, or location..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
              />
            </form>

            {/* Company Filter Dropdown */}
            <div className="relative min-w-[170px]">
              <select
                value={companyFilter}
                onChange={(e) => {
                  setCompanyFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="">All Companies</option>
                {availableCompanies.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="CLOSED">Inactive Only</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* UAN Filter Dropdown */}
            <div className="relative min-w-[130px]">
              <select
                value={uanFilter}
                onChange={(e) => {
                  setUanFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="ALL">All UAN</option>
                <option value="Required">UAN Required</option>
                <option value="Not Required">UAN Not Req.</option>
              </select>
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Shift Timing Filter Dropdown */}
            <div className="relative min-w-[150px]">
              <select
                value={shiftFilter}
                onChange={(e) => {
                  setShiftFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="ALL">All Shifts</option>
                <option value="Day Shift (India)">Day Shift (India)</option>
                <option value="US / American Shift">US / American Shift</option>
                <option value="UK / European Shift">UK / European Shift</option>
                <option value="Australian Shift">Australian Shift</option>
                <option value="Middle East / Gulf Shift">Middle East / Gulf Shift</option>
                <option value="Night Shift">Night Shift</option>
                <option value="Rotational Shift">Rotational Shift</option>
                <option value="Flexible / Hybrid">Flexible / Hybrid</option>
              </select>
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative min-w-[140px]">
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Date...</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset All Filters"
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50 shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Custom Date Pickers */}
          {dateFilter === 'custom' && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Date Range:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Clear Dates
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-y border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap">Company</th>
                <th className="py-3 px-3">Job Title</th>
                <th className="py-3 px-2 whitespace-nowrap">Location</th>
                <th className="py-3 px-2 whitespace-nowrap text-center">Shift</th>
                <th className="py-3 px-2 whitespace-nowrap text-center">UAN</th>
                <th className="py-3 px-2 whitespace-nowrap text-center">Notes</th>
                <th className="py-3 px-2 whitespace-nowrap text-center">Posted Date</th>
                <th className="py-3 px-2.5 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loadingJobs ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading job descriptions...
                  </td>
                </tr>
              ) : jobs.length > 0 ? (
                jobs.map((job: Job) => {
                  const isActive = job.status === 'ACTIVE';
                  const dateStr = job.postedDate
                    ? format(new Date(job.postedDate), 'MMM dd, yyyy')
                    : '—';

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.companyName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="text-[15px] font-bold text-slate-900 block leading-snug break-words"
                          title={job.jobTitle}
                        >
                          {job.jobTitle}
                        </span>
                        {job.skills && (
                          <span
                            className="text-xs text-slate-400 truncate block max-w-[380px] mt-0.5"
                            title={job.skills}
                          >
                            {job.skills}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-600 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1 max-w-[110px]" title={job.location || '—'}>
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{job.location || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap text-center">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                          title={job.shiftTiming || 'Day Shift (India)'}
                        >
                          <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{formatShiftShort(job.shiftTiming)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap text-center">
                        {job.uan === 'Required' ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs whitespace-nowrap"
                            title="UAN: Required"
                          >
                            <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Req.</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap"
                            title="UAN: Not Required"
                          >
                            <span>Not Req.</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap text-center">
                        {job.notes && job.notes.trim() ? (
                          <button
                            type="button"
                            onClick={() => setSelectedNotesJob(job)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                            title="Click to view notes"
                          >
                            <StickyNote className="w-3 h-3 text-blue-600" />
                            <span>Notes</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-600 text-xs whitespace-nowrap text-center">
                        {dateStr}
                      </td>
                      <td className="py-3 px-2.5 whitespace-nowrap text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            target="_blank"
                            title="View Public Page"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/jobs/${job.id}/edit`}
                            title="Edit JD"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No job descriptions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 pb-5 pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalJobs}
            itemsPerPage={10}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Export to Excel Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        totalJobs={totalJobs}
        totalPages={totalPages}
        currentPage={currentPage}
        itemsPerPage={10}
        filters={{
          search: searchQuery,
          company: companyFilter,
          status: statusFilter,
          uan: uanFilter,
          shiftTiming: shiftFilter,
          postedDate: dateFilter,
          startDate,
          endDate,
        }}
      />

      {/* Notes Modal */}
      <NotesModal
        isOpen={!!selectedNotesJob}
        onClose={() => setSelectedNotesJob(null)}
        title={selectedNotesJob?.jobTitle}
        company={selectedNotesJob?.companyName}
        notes={selectedNotesJob?.notes}
      />
    </div>
  );
}

