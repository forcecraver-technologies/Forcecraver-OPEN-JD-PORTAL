'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { Job } from '@/types/job';
import {
  Building2,
  PlusCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  Briefcase,
  Layers,
  UserCheck,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawCompanyName = params.companyName as string;
  const companyName = decodeURIComponent(rawCompanyName);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Handler state
  const [isEditingHandler, setIsEditingHandler] = useState(false);
  const [handlerInput, setHandlerInput] = useState('');
  const [savingHandler, setSavingHandler] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCompanyJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/companies/${encodeURIComponent(companyName)}/jobs`);
      if (res.ok) {
        const data = await res.json();
        const loadedJobs: Job[] = data.jobs || [];
        setJobs(loadedJobs);
        const existingHandler = loadedJobs.find((j) => j.contactPerson)?.contactPerson || '';
        setHandlerInput(existingHandler);
      }
    } catch (err) {
      console.error('Error fetching company jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [companyName]);

  useEffect(() => {
    fetchCompanyJobs();
  }, [fetchCompanyJobs]);

  const handleSaveHandler = async () => {
    try {
      setSavingHandler(true);
      const res = await fetch('/api/admin/companies/handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          contactPerson: handlerInput.trim(),
        }),
      });

      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => ({ ...j, contactPerson: handlerInput.trim() || null }))
        );
        setIsEditingHandler(false);
      }
    } catch (err) {
      console.error('Failed to update company handler:', err);
    } finally {
      setSavingHandler(false);
    }
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

  const openDeleteModal = (job: Job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/jobs/${jobToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
        setDeleteModalOpen(false);
        setJobToDelete(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = jobs.filter((j) => j.status === 'ACTIVE').length;
  const closedCount = jobs.filter((j) => j.status === 'CLOSED').length;
  const currentHandler = jobs.find((j) => j.contactPerson)?.contactPerson || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb / Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Companies</span>
        </Link>

        <Link
          href={`/companies/${encodeURIComponent(companyName)}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
        >
          <span>View Public Company Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <span>Organization Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {companyName}
            </h1>

            {/* Handled By Section */}
            <div className="flex items-center flex-wrap gap-3 pt-1">
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-xl text-xs">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold">Handled By:</span>
                {isEditingHandler ? (
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={handlerInput}
                      onChange={(e) => setHandlerInput(e.target.value)}
                      placeholder="Handler name"
                      className="text-xs px-2 py-0.5 rounded border border-blue-400 bg-white text-slate-900 outline-none w-28"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveHandler}
                      disabled={savingHandler}
                      className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingHandler(false)}
                      className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">
                      {currentHandler || <span className="text-slate-400 font-normal italic">Unassigned</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setHandlerInput(currentHandler || '');
                        setIsEditingHandler(true);
                      }}
                      className="text-slate-400 hover:text-blue-600 p-0.5"
                      title="Edit Handler"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {activeCount} Active JDs
              </span>
              {closedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  <XCircle className="w-3.5 h-3.5" />
                  {closedCount} Closed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Direct Add JD Button with pre-filled Company Name */}
        <Link
          href={`/admin/jobs/new?company=${encodeURIComponent(companyName)}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add JD for {companyName}</span>
        </Link>
      </div>

      {/* JDs List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>All Job Descriptions for {companyName} ({jobs.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-6">Job Title</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Experience</th>
                <th className="py-4 px-6">Posted Date</th>
                <th className="py-4 px-6">Status & Quick Toggle</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading job descriptions...
                  </td>
                </tr>
              ) : jobs.length > 0 ? (
                jobs.map((job) => {
                  const isActive = job.status === 'ACTIVE';
                  const dateStr = format(new Date(job.postedDate), 'MMM dd, yyyy');

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
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

                      {/* Experience */}
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.experience || '—'}</span>
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
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No job descriptions found for {companyName}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        jobTitle={jobToDelete?.jobTitle || ''}
        companyName={companyName}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setJobToDelete(null);
        }}
      />
    </div>
  );
}
