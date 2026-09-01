'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import { AdminStats, Job } from '@/types/job';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Building2,
  PlusCircle,
  ArrowRight,
  Eye,
  Edit,
  Calendar,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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

        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add New JD
          </Link>
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-all"
          >
            <Briefcase className="w-4 h-4" />
            Manage All JDs
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="Total JDs"
          value={loading ? '...' : stats?.totalJobs || 0}
          icon={Briefcase}
          color="blue"
          subtext="Total posted descriptions"
        />
        <AdminStatsCard
          title="Active JDs"
          value={loading ? '...' : stats?.activeJobs || 0}
          icon={CheckCircle2}
          color="emerald"
          subtext="Publicly discoverable"
        />
        <AdminStatsCard
          title="Closed JDs"
          value={loading ? '...' : stats?.closedJobs || 0}
          icon={XCircle}
          color="slate"
          subtext="Archived or filled"
        />
        <AdminStatsCard
          title="Hiring Companies"
          value={loading ? '...' : stats?.totalCompanies || 0}
          icon={Building2}
          color="purple"
          subtext="Distinct organizations"
        />
      </div>

      {/* Recent Job Descriptions Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Job Descriptions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest postings added to the database
            </p>
          </div>

          <Link
            href="/admin/jobs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table Content */}
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading recent JDs...
                  </td>
                </tr>
              ) : stats && stats.recentJobs.length > 0 ? (
                stats.recentJobs.map((job: Job) => {
                  const isActive = job.status === 'ACTIVE';
                  const dateStr = format(new Date(job.postedDate), 'MMM dd, yyyy');

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {job.companyName}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {job.jobTitle}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {job.location || '—'}
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        {dateStr}
                      </td>
                      <td className="py-4 px-6">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
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
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No job descriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
