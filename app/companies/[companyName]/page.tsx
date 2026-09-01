import React from 'react';
import Link from 'next/link';
import { JobsService } from '@/services/jobs.service';
import JobCard from '@/components/JobCard';
import { Building2, ArrowLeft, Briefcase, CheckCircle2 } from 'lucide-react';

interface CompanyDetailsProps {
  params: Promise<{ companyName: string }>;
}

export async function generateMetadata({ params }: CompanyDetailsProps) {
  const { companyName } = await params;
  const decodedName = decodeURIComponent(companyName);
  return {
    title: `${decodedName} Active JDs | Open JD Portal`,
    description: `Browse all verified active job descriptions at ${decodedName}.`,
  };
}

export default async function CompanyDetailsPage({ params }: CompanyDetailsProps) {
  const { companyName } = await params;
  const decodedName = decodeURIComponent(companyName);
  const jobs = await JobsService.getJobsByCompany(decodedName, false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-blue-500/20">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Verified Employer
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {decodedName}
            </h1>
            <div className="flex items-center flex-wrap gap-3 pt-1">
              {jobs.some((j) => j.contactPerson) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Handled By:</span>
                  <span className="font-bold text-blue-700">{jobs.find((j) => j.contactPerson)?.contactPerson}</span>
                </span>
              )}
              <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-slate-900 font-bold">{jobs.length}</span> Active{' '}
                {jobs.length === 1 ? 'Job Description' : 'Job Descriptions'}
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50/50 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors self-start md:self-center"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Link>
      </div>

      {/* Jobs Listing */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Active Opportunities at {decodedName}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            {jobs.length}
          </span>
        </h2>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Active Jobs Currently</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              There are currently no active job descriptions posted by {decodedName}.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
            >
              Browse All Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
