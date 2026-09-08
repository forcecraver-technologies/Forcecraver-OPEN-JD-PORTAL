'use client';

import React from 'react';
import { AlertTriangle, Trash2, X, Building2 } from 'lucide-react';

interface DeleteCompanyModalProps {
  isOpen: boolean;
  companyName: string;
  totalJobsCount: number;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteCompanyModal({
  isOpen,
  companyName,
  totalJobsCount,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteCompanyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog Box */}
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <h3 className="text-xl font-bold text-slate-900">Delete Company?</h3>
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Building2 className="w-5 h-5 text-slate-600 shrink-0" />
            <span className="font-bold text-slate-900 text-sm truncate">{companyName}</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pt-1">
            This will permanently delete <strong className="text-slate-900">{companyName}</strong> and all{' '}
            <strong className="text-rose-600 font-bold">{totalJobsCount} associated job posting{totalJobsCount === 1 ? '' : 's'}</strong>{' '}
            from the database. This action <span className="underline font-semibold text-rose-700">cannot be undone</span>.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting Company...' : 'Yes, Delete Company'}
          </button>
        </div>
      </div>
    </div>
  );
}
