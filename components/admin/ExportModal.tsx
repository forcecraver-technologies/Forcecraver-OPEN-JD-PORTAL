'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalJobs: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage?: number;
  apiEndpoint?: string;
  filters: {
    search?: string;
    company?: string;
    status?: string;
    uan?: string;
    shiftTiming?: string;
    postedDate?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default function ExportModal({
  isOpen,
  onClose,
  totalJobs,
  totalPages,
  currentPage,
  itemsPerPage = 12,
  apiEndpoint = '/api/admin/jobs/export',
  filters,
}: ExportModalProps) {
  const [scope, setScope] = useState<'current' | 'all' | 'range'>('current');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(Math.min(totalPages, Math.max(1, currentPage)));
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const validTotalPages = Math.max(1, totalPages);

  // Compute estimated records count
  let estimatedCount = 0;
  if (scope === 'current') {
    estimatedCount = Math.min(itemsPerPage, totalJobs);
  } else if (scope === 'all') {
    estimatedCount = totalJobs;
  } else if (scope === 'range') {
    const pagesCount = Math.max(1, endPage - startPage + 1);
    estimatedCount = Math.min(totalJobs, pagesCount * itemsPerPage);
  }

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.company) params.set('company', filters.company);
      if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
      if (filters.uan && filters.uan !== 'ALL') params.set('uan', filters.uan);
      if (filters.shiftTiming && filters.shiftTiming !== 'ALL') params.set('shiftTiming', filters.shiftTiming);
      if (filters.postedDate && filters.postedDate !== 'all') params.set('postedDate', filters.postedDate);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      params.set('scope', scope);
      params.set('limit', itemsPerPage.toString());
      params.set('page', currentPage.toString());

      if (scope === 'range') {
        params.set('startPage', startPage.toString());
        params.set('endPage', endPage.toString());
      }

      const res = await fetch(`${apiEndpoint}?${params.toString()}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate Excel export.');
      }

      // Trigger native download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `Job_Postings_Export.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMsg(`Successfully exported ${estimatedCount} job descriptions!`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1400);
    } catch (err: any) {
      console.error('Export download error:', err);
      setErrorMsg(err.message || 'An error occurred while downloading.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl z-10 border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Export to Excel (.xlsx)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download structured spreadsheet of job descriptions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Filters Summary */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Active Filter Scope:
            </span>
            <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
              {totalJobs} Total Matching Entries
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-slate-600">
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
              Company: <strong>{filters.company || 'All'}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
              Status:{' '}
              <strong>
                {filters.status === 'ACTIVE'
                  ? 'Active Only'
                  : filters.status === 'CLOSED'
                  ? 'Inactive Only'
                  : 'All'}
              </strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
              Date:{' '}
              <strong>
                {filters.startDate || filters.endDate
                  ? `${filters.startDate || 'Start'} to ${filters.endDate || 'Today'}`
                  : filters.postedDate === 'today'
                  ? 'Today'
                  : filters.postedDate === '7days'
                  ? 'Last 7 Days'
                  : filters.postedDate === '30days'
                  ? 'Last 30 Days'
                  : 'All Time'}
              </strong>
            </span>
            {filters.uan && filters.uan !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
                UAN: <strong>{filters.uan}</strong>
              </span>
            )}
            {filters.shiftTiming && filters.shiftTiming !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
                Shift: <strong>{filters.shiftTiming}</strong>
              </span>
            )}
            {filters.search && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
                Keyword: <strong>&ldquo;{filters.search}&rdquo;</strong>
              </span>
            )}
          </div>
        </div>

        {/* Scope Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Pages to Download:
          </label>

          <div className="space-y-2.5">
            {/* Option 1: Current Page */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                scope === 'current'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="exportScope"
                  value="current"
                  checked={scope === 'current'}
                  onChange={() => setScope('current')}
                  className="w-4 h-4 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    Current Page Only (Page {currentPage})
                  </div>
                  <div className="text-xs text-slate-500">
                    Exports only entries visible on this page (up to {itemsPerPage} items)
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                ~{Math.min(itemsPerPage, totalJobs)} rows
              </span>
            </label>

            {/* Option 2: All Pages */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                scope === 'all'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="exportScope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                  className="w-4 h-4 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    All Pages ({validTotalPages} {validTotalPages === 1 ? 'Page' : 'Pages'})
                  </div>
                  <div className="text-xs text-slate-500">
                    Exports all {totalJobs} matching records across entire dataset
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                {totalJobs} rows
              </span>
            </label>

            {/* Option 3: Page Range */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                scope === 'range'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="exportScope"
                    value="range"
                    checked={scope === 'range'}
                    onChange={() => setScope('range')}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      Specific Page Range
                    </div>
                    <div className="text-xs text-slate-500">
                      Choose which pages to export (e.g. from Page 1 to Page 3)
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                  ~{estimatedCount} rows
                </span>
              </label>

              {scope === 'range' && (
                <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-semibold">From Page:</span>
                    <input
                      type="number"
                      min={1}
                      max={validTotalPages}
                      value={startPage}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(validTotalPages, parseInt(e.target.value) || 1));
                        setStartPage(val);
                        if (val > endPage) setEndPage(val);
                      }}
                      className="w-16 px-2.5 py-1.5 text-xs text-center font-bold text-slate-900 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400" />

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-semibold">To Page:</span>
                    <input
                      type="number"
                      min={startPage}
                      max={validTotalPages}
                      value={endPage}
                      onChange={(e) => {
                        const val = Math.max(startPage, Math.min(validTotalPages, parseInt(e.target.value) || startPage));
                        setEndPage(val);
                      }}
                      className="w-16 px-2.5 py-1.5 text-xs text-center font-bold text-slate-900 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <span className="text-xs text-slate-400 ml-auto">
                    (Max: {validTotalPages})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columns included reminder */}
        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Columns in sheet: <strong>Status, Company, Job Title, SPOC, Experience, Location, Salary, Skills, JD, Date</strong>.
          </span>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={downloading}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || totalJobs === 0}
            className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Excel...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Excel (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
