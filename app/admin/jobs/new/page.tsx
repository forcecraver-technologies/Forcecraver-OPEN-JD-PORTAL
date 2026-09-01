import React, { Suspense } from 'react';
import JobForm from '@/components/admin/JobForm';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Post New Job Description | Open JD Portal Admin',
};

export default function AddNewJobPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <PlusCircle className="w-4 h-4" />
            Create Posting
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Add New Job Description
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish a new JD directly to the PostgreSQL database.
          </p>
        </div>

        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Manage JDs
        </Link>
      </div>

      {/* Form with Suspense */}
      <Suspense
        fallback={
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading Form...
          </div>
        }
      >
        <JobForm mode="create" />
      </Suspense>
    </div>
  );
}
