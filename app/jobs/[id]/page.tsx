import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JobsService } from '@/services/jobs.service';
import {
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Share2,
  FileText,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';

interface JobDetailsProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobDetailsProps) {
  const { id } = await params;
  const job = await JobsService.getJobById(id);
  if (!job) return { title: 'Job Not Found | Open JD Portal' };

  return {
    title: `${job.jobTitle} at ${job.companyName} | Open JD Portal`,
    description: `View full job description for ${job.jobTitle} at ${job.companyName}. Location: ${job.location || 'Not specified'}. Experience: ${job.experience || 'Not specified'}.`,
  };
}

export default async function JobDetailsPage({ params }: JobDetailsProps) {
  const { id } = await params;
  const job = await JobsService.getJobById(id);

  if (!job) {
    notFound();
  }

  const isActive = job.status === 'ACTIVE';
  const parsedDate = new Date(job.postedDate);
  const formattedDate = !isNaN(parsedDate.getTime())
    ? format(parsedDate, 'MMMM dd, yyyy')
    : 'Recently';

  const skillsList = job.skills
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Jobs
        </Link>

        <span className="text-xs text-slate-400 font-mono">Job ID: {job.id}</span>
      </div>

      {/* Closed Job Alert Banner */}
      {!isActive && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-start gap-4 text-amber-900 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-amber-900">This job is currently closed.</h3>
            <p className="text-sm text-amber-700 mt-0.5">
              The employer is no longer accepting new applications or inquiries for this position.
            </p>
          </div>
        </div>
      )}

      {/* Main Job Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-3">
            {/* Status Badge */}
            <div className="flex items-center gap-2.5">
              {isActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active Opportunity
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                  <XCircle className="w-3.5 h-3.5" />
                  Position Closed
                </span>
              )}
            </div>

            {/* Job Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {job.jobTitle}
            </h1>

            {/* Company Link */}
            <Link
              href={`/companies/${encodeURIComponent(job.companyName)}`}
              className="inline-flex items-center gap-2 text-base sm:text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors group"
            >
              <Building2 className="w-5 h-5 text-blue-500" />
              <span className="group-hover:underline underline-offset-4">{job.companyName}</span>
              <span className="text-xs font-normal text-slate-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                View Company Profile
              </span>
            </Link>
          </div>
        </div>

        {/* Structured Job Information Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" /> Location
            </span>
            <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">
              {job.location || 'Not Specified'}
            </p>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" /> Experience
            </span>
            <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">
              {job.experience || 'Not Specified'}
            </p>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-blue-600" /> Salary / Budget
            </span>
            <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">
              {job.salaryBudget || 'Competitive'}
            </p>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              {job.contactPerson ? (
                <>
                  <UserCheck className="w-4 h-4 text-blue-600" /> Handled By
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-blue-600" /> Posted Date
                </>
              )}
            </span>
            <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">
              {job.contactPerson || formattedDate}
            </p>
          </div>
        </div>

        {/* Required Skills Section */}
        {skillsList.length > 0 && (
          <div className="py-6 border-b border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Required Skills & Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50/80 text-blue-800 border border-blue-200/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Complete Job Description */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">Full Job Description</h2>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50/50 p-6 sm:p-8 rounded-2xl border border-slate-100 font-sans">
            {job.jobDescription}
          </div>
        </div>
      </div>
    </div>
  );
}
