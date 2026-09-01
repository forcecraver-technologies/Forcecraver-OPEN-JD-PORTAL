'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Pagination from '@/components/Pagination';
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
} from 'lucide-react';
import { format } from 'date-fns';

function ManageJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [currentPage, setCurrentPage] = useState(
    searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
  );

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

  const fetchAdminJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
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
  }, [searchQuery, statusFilter, currentPage]);

  useEffect(() => {
    fetchAdminJobs();
  }, [fetchAdminJobs]);

  // Clean selections if page or filters change
  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage, statusFilter, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAdminJobs();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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

        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add New JD
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, title, skills, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </form>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs font-semibold">
            {['ALL', 'ACTIVE', 'CLOSED'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              title="Reset Filters"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
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
                <th className="py-4 px-4 w-12 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={jobs.length === 0}
                    className="p-1 rounded text-slate-500 hover:text-blue-600 focus:outline-none"
                    title={isAllSelected ? 'Deselect All' : 'Select All'}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : isIndeterminate ? (
                      <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-600 flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-blue-600" />
                      </div>
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">Company</th>
                <th className="py-4 px-6">Job Title</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Posted Date</th>
                <th className="py-4 px-6">Status & Quick Toggle</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
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
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(job.id)}
                          className="p-1 rounded text-slate-500 hover:text-blue-600 focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                          )}
                        </button>
                      </td>

                      {/* Company */}
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{job.companyName}</span>
                        </div>
                      </td>

                      {/* Job Title */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 line-clamp-1">
                          {job.jobTitle}
                        </span>
                        {job.skills && (
                          <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {job.skills}
                          </span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6 text-slate-600 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.location || '—'}</span>
                        </div>
                      </td>

                      {/* Posted Date */}
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job)}
                          disabled={updatingStatusId === job.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                          } ${updatingStatusId === job.id ? 'opacity-50 cursor-wait' : ''}`}
                          title="Click to toggle status"
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>Closed</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/jobs/${job.id}`}
                            target="_blank"
                            title="View Public Page"
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/jobs/${job.id}/edit`}
                            title="Edit JD"
                            className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(job)}
                            title="Delete JD"
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
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
