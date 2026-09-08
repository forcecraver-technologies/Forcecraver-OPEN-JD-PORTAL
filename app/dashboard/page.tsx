'use client';

import React, { Suspense } from 'react';
import JobDirectoryTable from '@/components/JobDirectoryTable';
import { LayoutDashboard, Sparkles, Building2, Briefcase } from 'lucide-react';
import Link from 'next/link';

function PublicDashboardContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 rounded-3xl text-white shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Live Opportunities Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Job Descriptions Dashboard
          </h1>
          <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
            Discover, filter, and export active job postings across hiring organizations in a single structured directory table.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/20 transition-all backdrop-blur-xs"
          >
            <Building2 className="w-4 h-4" />
            <span>Hiring Companies</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-sm font-bold rounded-xl shadow-md transition-all"
          >
            <Briefcase className="w-4 h-4" />
            <span>Card View</span>
          </Link>
        </div>
      </div>

      {/* Main Table Directory */}
      <JobDirectoryTable isPublic={true} />
    </div>
  );
}

export default function PublicDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading Job Dashboard...</p>
        </div>
      }
    >
      <PublicDashboardContent />
    </Suspense>
  );
}
