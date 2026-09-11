'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import ExportModal from '@/components/admin/ExportModal';
import Pagination from '@/components/Pagination';
import NotesModal from '@/components/NotesModal';
import { Job } from '@/types/job';
import {
  Briefcase,
  PlusCircle,
  Search,
  Building2,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RotateCcw,
  CheckSquare,
  Square,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  Filter,
  ShieldCheck,
  StickyNote,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatShiftShort } from '@/lib/formatters';

function ManageJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [companyFilter, setCompanyFilter] = useState(searchParams.get('company') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [uanFilter, setUanFilter] = useState(searchParams.get('uan') || 'ALL');
  const [shiftFilter, setShiftFilter] = useState(searchParams.get('shiftTiming') || 'ALL');
  const [dateFilter, setDateFilter] = useState(searchParams.get('postedDate') || 'all');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [currentPage, setCurrentPage] = useState(
    searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
  );

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

  // Multiple selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Single / Bulk Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating state
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Load companies for the dropdown
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch('/api/admin/companies');
        if (res.ok) {
          const data = await res.json();
          const names = (data.companies || []).map((c: any) => c.companyName);
          setAvailableCompanies(names);
        }
      } catch (err) {
        console.error('Failed to load companies for filter:', err);
      }
    }
    loadCompanies();
  }, []);

  const fetchAdminJobs = useCallback(async () => {
    try {
      setLoading(true);
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
      params.set('limit', '12');

      const res = await fetch(`/api/admin/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setTotalJobs(data.pagination.total || 0);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, companyFilter, statusFilter, uanFilter, shiftFilter, dateFilter, startDate, endDate, currentPage]);

  useEffect(() => {
    fetchAdminJobs();
  }, [fetchAdminJobs]);

  // Clean selections if page or filters change
  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage, statusFilter, companyFilter, uanFilter, shiftFilter, dateFilter, startDate, endDate, debouncedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setDebouncedSearch(searchQuery);
  };

  const handleToggleStatus = async (job: Job) => {
    const nextStatus = job.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      setUpdatingStatusId(job.id);
      const res = await fetch(`/api/admin/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j))
        );
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === jobs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(jobs.map((j) => j.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Status Update (Set Active or Set Closed)
  const handleBulkStatusUpdate = async (status: 'ACTIVE' | 'CLOSED') => {
    if (selectedIds.length === 0) return;

    try {
      setBulkProcessing(true);
      const res = await fetch('/api/admin/jobs/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status }),
      });

      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (selectedIds.includes(j.id) ? { ...j, status } : j))
        );
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Bulk status update failed:', err);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Open single delete
  const openDeleteModal = (job: Job) => {
    setIsBulkDelete(false);
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  // Open bulk delete
  const openBulkDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setIsBulkDelete(true);
    setDeleteModalOpen(true);
  };

  // Confirm delete (single or bulk)
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (isBulkDelete) {
        const res = await fetch('/api/admin/jobs/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });

        if (res.ok) {
          setJobs((prev) => prev.filter((j) => !selectedIds.includes(j.id)));
          setTotalJobs((prev) => Math.max(0, prev - selectedIds.length));
          setSelectedIds([]);
          setDeleteModalOpen(false);
        }
      } else if (jobToDelete) {
        const res = await fetch(`/api/admin/jobs/${jobToDelete.id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
          setTotalJobs((prev) => Math.max(0, prev - 1));
          setDeleteModalOpen(false);
          setJobToDelete(null);
        }
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const isAllSelected = jobs.length > 0 && selectedIds.length === jobs.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < jobs.length;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Job Descriptions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Total {totalJobs} job {totalJobs === 1 ? 'record' : 'records'} in PostgreSQL database
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Download XLS Button */}
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all"
            title="Export job descriptions to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download XLS</span>
          </button>

          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add New JD
          </Link>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        {/* Row 1: Search, Company select, Status select, Date select, Reset */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, skills, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </form>

          {/* Company Filter Dropdown */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative min-w-[170px] flex-1 sm:flex-initial">
              <select
                value={companyFilter}
                onChange={(e) => {
                  setCompanyFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="">All Companies</option>
                {availableCompanies.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative min-w-[130px] flex-1 sm:flex-initial">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active (Open)</option>
                <option value="CLOSED">Inactive (Closed)</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {/* UAN Filter Dropdown */}
            <div className="relative min-w-[130px] flex-1 sm:flex-initial">
              <select
                value={uanFilter}
                onChange={(e) => {
                  setUanFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="ALL">All UAN</option>
                <option value="Required">UAN Required</option>
                <option value="Not Required">UAN Not Req.</option>
              </select>
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {/* Shift Timing Filter Dropdown */}
            <div className="relative min-w-[150px] flex-1 sm:flex-initial">
              <select
                value={shiftFilter}
                onChange={(e) => {
                  setShiftFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none pr-8 cursor-pointer"
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
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative min-w-[145px] flex-1 sm:flex-initial">
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Date...</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {/* Reset Filters Button */}
            {(searchQuery || companyFilter || statusFilter !== 'ALL' || uanFilter !== 'ALL' || shiftFilter !== 'ALL' || dateFilter !== 'all' || startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCompanyFilter('');
                  setStatusFilter('ALL');
                  setUanFilter('ALL');
                  setShiftFilter('ALL');
                  setDateFilter('all');
                  setStartDate('');
                  setEndDate('');
                  setCurrentPage(1);
                }}
                title="Reset All Filters"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50 shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Custom Date Range Pickers (if dateFilter === 'custom') */}
        {dateFilter === 'custom' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Custom Date Range:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:border-blue-500 focus:bg-white"
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

      {/* BULK ACTIONS TOOLBAR (Appears when 1 or more JDs are selected) */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
              {selectedIds.length}
            </span>
            <span className="font-semibold text-sm">
              {selectedIds.length === 1 ? '1 JD selected' : `${selectedIds.length} JDs selected`}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => handleBulkStatusUpdate('ACTIVE')}
              disabled={bulkProcessing}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Active (Open)</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkStatusUpdate('CLOSED')}
              disabled={bulkProcessing}
              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 border border-slate-600"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark as Closed</span>
            </button>

            <button
              type="button"
              onClick={openBulkDeleteModal}
              disabled={bulkProcessing}
              className="px-3.5 py-1.5 bg-rose-600/90 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Main Jobs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                {/* Select All Checkbox */}
                <th className="py-3 px-2 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={jobs.length === 0}
                    className="p-1 rounded text-slate-500 hover:text-blue-600 focus:outline-none"
                    title={isAllSelected ? 'Deselect All' : 'Select All'}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : isIndeterminate ? (
                      <div className="w-3.5 h-3.5 rounded bg-blue-100 border-2 border-blue-600 flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-blue-600" />
                      </div>
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Company</th>
                <th className="py-3 px-3">Job Title</th>
                <th className="py-3 px-2 whitespace-nowrap">Location</th>
                <th className="py-3 px-2 whitespace-nowrap text-center">Shift</th>
                <th className="py-3 px-2 whitespace-nowrap text-center">UAN</th>
                <th className="py-3 px-2 whitespace-nowrap text-center">Notes</th>
                <th className="py-3 px-2 whitespace-nowrap text-center">Posted Date</th>
                <th className="py-3 px-2.5 whitespace-nowrap text-center" title="Click to toggle status">Status</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading job descriptions...
                  </td>
                </tr>
              ) : jobs.length > 0 ? (
                jobs.map((job) => {
                  const isActive = job.status === 'ACTIVE';
                  const isSelected = selectedIds.includes(job.id);
                  const dateStr = format(new Date(job.postedDate), 'MMM dd, yyyy');

                  return (
                    <tr
                      key={job.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(job.id)}
                          className="p-1 rounded text-slate-500 hover:text-blue-600 focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                          )}
                        </button>
                      </td>

                      {/* Company */}
                      <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.companyName}</span>
                        </div>
                      </td>

                      {/* Job Title */}
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

                      {/* Location */}
                      <td className="py-3 px-2 text-slate-600 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1 max-w-[110px]" title={job.location || '—'}>
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{job.location || '—'}</span>
                        </div>
                      </td>

                      {/* Shift Timing */}
                      <td className="py-3 px-2 whitespace-nowrap text-center">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                          title={job.shiftTiming || 'Day Shift (India)'}
                        >
                          <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{formatShiftShort(job.shiftTiming)}</span>
                        </span>
                      </td>

                      {/* UAN Requirement */}
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

                      {/* Notes */}
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

                      {/* Posted Date */}
                      <td className="py-3 px-2 text-slate-600 text-xs whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="py-3 px-2.5 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job)}
                          disabled={updatingStatusId === job.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                          } ${updatingStatusId === job.id ? 'opacity-50 cursor-wait' : ''}`}
                          title="Click to toggle status"
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-500" />
                              <span>Closed</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/jobs/${job.id}`}
                            target="_blank"
                            title="View Public Page"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/admin/jobs/${job.id}/edit`}
                            title="Edit JD"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(job)}
                            title="Delete JD"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No job descriptions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 pb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalJobs}
            itemsPerPage={12}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal (Handles Single or Bulk Deletion) */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        jobTitle={
          isBulkDelete
            ? `${selectedIds.length} selected job descriptions`
            : jobToDelete?.jobTitle || ''
        }
        companyName={
          isBulkDelete
            ? 'multiple organizations'
            : jobToDelete?.companyName || ''
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setJobToDelete(null);
          setIsBulkDelete(false);
        }}
      />

      {/* Export to Excel Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        totalJobs={totalJobs}
        totalPages={totalPages}
        currentPage={currentPage}
        itemsPerPage={12}
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

export default function AdminManageJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading Job Management...</p>
        </div>
      }
    >
      <ManageJobsContent />
    </Suspense>
  );
}
