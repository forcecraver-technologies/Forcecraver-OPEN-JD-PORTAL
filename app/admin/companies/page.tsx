'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DeleteCompanyModal from '@/components/admin/DeleteCompanyModal';
import { CompanyAdminStats } from '@/types/job';
import {
  Building2,
  PlusCircle,
  Briefcase,
  Search,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Layers,
  User,
  UserCheck,
  Edit2,
  Check,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyAdminStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline editing handler state
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editingHandlerName, setEditingHandlerName] = useState('');
  const [savingHandler, setSavingHandler] = useState(false);

  // Delete Company modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<CompanyAdminStats | null>(null);
  const [isDeletingCompany, setIsDeletingCompany] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Expand / collapse JD list state per company
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpandCard = (companyName: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error('Error fetching admin companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleStartEditHandler = (company: CompanyAdminStats) => {
    setEditingCompany(company.companyName);
    setEditingHandlerName(company.contactPerson || '');
  };

  const handleSaveHandler = async (companyName: string) => {
    try {
      setSavingHandler(true);
      const res = await fetch('/api/admin/companies/handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          contactPerson: editingHandlerName.trim(),
        }),
      });

      if (res.ok) {
        setCompanies((prev) =>
          prev.map((c) =>
            c.companyName === companyName
              ? { ...c, contactPerson: editingHandlerName.trim() || null }
              : c
          )
        );
        setEditingCompany(null);
      }
    } catch (err) {
      console.error('Failed to update company handler:', err);
    } finally {
      setSavingHandler(false);
    }
  };

  const handleOpenDeleteModal = (company: CompanyAdminStats) => {
    setCompanyToDelete(company);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteCompany = async () => {
    if (!companyToDelete) return;
    try {
      setIsDeletingCompany(true);
      const res = await fetch(
        `/api/admin/companies?companyName=${encodeURIComponent(companyToDelete.companyName)}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setCompanies((prev) =>
          prev.filter((c) => c.companyName !== companyToDelete.companyName)
        );
        setNotification(
          `Successfully deleted company "${companyToDelete.companyName}" and all associated jobs.`
        );
        setTimeout(() => setNotification(null), 4000);
        setDeleteModalOpen(false);
        setCompanyToDelete(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Failed to delete company.');
      }
    } catch (err) {
      console.error('Failed to delete company:', err);
      alert('An error occurred while deleting the company.');
    } finally {
      setIsDeletingCompany(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const totalActiveJds = companies.reduce((acc, c) => acc + c.activeCount, 0);
  const totalClosedJds = companies.reduce((acc, c) => acc + c.closedCount, 0);
  const totalAllJds = companies.reduce((acc, c) => acc + c.totalCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Success Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            Company-Wise Job Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Companies Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage JDs, assign company handlers/account managers, and post new JDs with one click.
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{companies.length}</div>
            <div className="text-xs text-slate-500 font-medium">Hiring Organizations</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700">{totalActiveJds}</div>
            <div className="text-xs text-slate-500 font-medium">Total Active JDs</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{totalAllJds}</div>
            <div className="text-xs text-slate-500 font-medium">Total Stored JDs ({totalClosedJds} closed)</div>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading companies directory...
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const dateStr = company.latestPostedDate
              ? format(new Date(company.latestPostedDate), 'MMM dd, yyyy')
              : '—';

            const isEditingThis = editingCompany === company.companyName;
            const isExpanded = Boolean(expandedCards[company.companyName]);
            const jobsList = company.jobs || [];

            return (
              <div
                key={company.companyName}
                className="bg-white rounded-3xl border border-slate-200 hover:border-blue-300 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
              >
                {/* Top Company Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-2xs">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {company.companyName}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Latest posting: {dateStr}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/companies/${encodeURIComponent(company.companyName)}`}
                        target="_blank"
                        title="View Public Profile"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {/* Top quick delete button */}
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(company)}
                        title={`Delete ${company.companyName}`}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Handled By / Contact Person Section */}
                  <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center justify-between gap-2">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={editingHandlerName}
                          onChange={(e) => setEditingHandlerName(e.target.value)}
                          placeholder="Handler name (e.g. Sarthak)"
                          autoFocus
                          className="w-full text-xs px-2.5 py-1 rounded-lg border border-blue-400 bg-white outline-none focus:ring-1 focus:ring-blue-400 font-medium text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveHandler(company.companyName)}
                          disabled={savingHandler}
                          className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          title="Save Handler"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCompany(null)}
                          className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            <UserCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                              Handled By
                            </span>
                            <span className="font-bold text-slate-800 line-clamp-1">
                              {company.contactPerson || (
                                <span className="text-slate-400 font-normal italic">Unassigned</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartEditHandler(company)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Handler / SPOC"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Badges / Counters */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {company.activeCount} Active
                    </span>

                    {company.closedCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        {company.closedCount} Inactive
                      </span>
                    )}

                    <span className="text-xs text-slate-400 ml-auto font-medium">
                      Total: {company.totalCount} JDs
                    </span>
                  </div>

                  {/* ACTIVE & INACTIVE JD POSTS LIST IN CARD */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        JD Postings ({jobsList.length})
                      </span>
                      {jobsList.length > 3 && (
                        <button
                          type="button"
                          onClick={() => toggleExpandCard(company.companyName)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
                        >
                          {isExpanded ? (
                            <>
                              <span>Show less</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>Show all ({jobsList.length})</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                      {jobsList.length > 0 ? (
                        (isExpanded ? jobsList : jobsList.slice(0, 3)).map((job) => {
                          const isActive = job.status === 'ACTIVE';
                          return (
                            <div
                              key={job.id}
                              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-colors flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                  />
                                  <span className="font-semibold text-xs text-slate-900 truncate block">
                                    {job.jobTitle}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 ml-3.5">
                                  <span>{job.location || 'Remote'}</span>
                                  {job.postedDate && (
                                    <>
                                      <span>•</span>
                                      <span>{format(new Date(job.postedDate), 'MMM d, yyyy')}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    isActive
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-slate-200 text-slate-600 border border-slate-300'
                                  }`}
                                >
                                  {isActive ? 'Active' : 'Inactive'}
                                </span>
                                <Link
                                  href={`/admin/jobs/${job.id}/edit`}
                                  title="Edit JD"
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-white transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-3 text-xs text-slate-400 italic">
                          No JD posts found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Add JD, Manage JDs, and Delete Company */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  {/* Direct Add JD */}
                  <Link
                    href={`/admin/jobs/new?company=${encodeURIComponent(company.companyName)}`}
                    className="inline-flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl transition-all border border-blue-200 hover:border-blue-600 shadow-2xs"
                    title="Add New JD for this organization"
                  >
                    <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">+ Add JD</span>
                  </Link>

                  {/* Manage JDs */}
                  <Link
                    href={`/admin/companies/${encodeURIComponent(company.companyName)}`}
                    className="inline-flex items-center justify-center gap-1 px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all"
                    title="Manage all JDs for this company"
                  >
                    <span className="truncate">Manage ({company.totalCount})</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>

                  {/* Delete Company Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenDeleteModal(company)}
                    className="inline-flex items-center justify-center gap-1 px-2 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-bold text-xs rounded-xl transition-all border border-rose-200 hover:border-rose-600 shadow-2xs"
                    title="Delete Company and all its JDs"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No companies found</h3>
          <p className="text-xs text-slate-400 mt-1">
            No organization matches &quot;{searchQuery}&quot;. Try resetting your search.
          </p>
        </div>
      )}

      {/* Delete Company Confirmation Modal */}
      <DeleteCompanyModal
        isOpen={deleteModalOpen}
        companyName={companyToDelete?.companyName || ''}
        totalJobsCount={companyToDelete?.totalCount || 0}
        isDeleting={isDeletingCompany}
        onConfirm={handleConfirmDeleteCompany}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCompanyToDelete(null);
        }}
      />
    </div>
  );
}
