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
  ShieldCheck,
  StickyNote,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import LinkedInPostButton from '@/components/LinkedInPostButton';
import CopyJDButton from '@/components/CopyJDButton';
import EnhanceJDButton from '@/components/EnhanceJDButton';

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Jobs
        </Link>

        <div className="flex items-center gap-2.5">
          <CopyJDButton
            text={job.jobDescription}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          />
          <LinkedInPostButton job={job} />
          <EnhanceJDButton job={job} />
          <span className="text-xs text-slate-400 font-mono">Job ID: {job.id.slice(0, 8)}</span>
        </div>
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
            {/* Status & UAN Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
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

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {job.shiftTiming || 'Day Shift (India)'}
              </span>

              {job.uan === 'Required' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  UAN Required
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  UAN Not Required
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 py-6 border-b border-slate-100">
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
              <Clock className="w-4 h-4 text-blue-600" /> Shift Timing
            </span>
            <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">
              {job.shiftTiming || 'Day Shift (India)'}
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
              <ShieldCheck className="w-4 h-4 text-blue-600" /> UAN Status
            </span>
            <p className={`mt-1 text-sm sm:text-base font-bold ${job.uan === 'Required' ? 'text-amber-800' : 'text-slate-900'}`}>
              {job.uan || 'Not Required'}
            </p>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
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

        {/* Important Notes Section */}
        {job.notes && job.notes.trim() && (
          <div className="py-6 border-b border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-2xs">
                  <StickyNote className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Important Notes & Instructions</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Recruiter Notes
              </span>
            </div>
            <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-blue-100 shadow-2xs">
              {job.notes}
            </div>
          </div>
        )}

        {/* Scheduled Interviews & Candidates Section */}
        {job.interviews && job.interviews.length > 0 && (
          <div className="py-6 border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-2xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Scheduled Candidate Interviews</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {job.interviews.length} Scheduled
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Active interview appointments scheduled for this role. Click any candidate to view their interview slot.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job.interviews.map((intv) => {
                const interviewPortalUrl = process.env.NEXT_PUBLIC_INTERVIEW_PORTAL_URL || 'https://interview.forcecraver.com';
                const slotUrl = `${interviewPortalUrl}/slots/${encodeURIComponent(intv.referenceCode)}`;
                const intvDate = new Date(intv.interviewDate);
                const formattedDate = !isNaN(intvDate.getTime()) ? format(intvDate, 'EEEE, MMMM dd, yyyy') : '';

                return (
                  <div
                    key={intv.id}
                    className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border border-emerald-200/90 hover:border-emerald-400 transition-all flex flex-col justify-between gap-4 shadow-2xs group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5 group-hover:text-emerald-700 transition-colors">
                            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            {intv.candidate?.name || 'Candidate'}
                          </h4>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            Ref: {intv.referenceCode}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wide">
                          {intv.status}
                        </span>
                      </div>

                      <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                        {formattedDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium">{formattedDate}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">{intv.startTime} – {intv.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Status: <strong className="text-slate-800">{intv.status}</strong></span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={slotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-2xs hover:shadow-xs group/btn"
                    >
                      <span>Open Candidate Slot in Interview Portal</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Complete Job Description */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 text-slate-900">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold">Full Job Description</h2>
            </div>

            <div className="flex items-center gap-2">
              <CopyJDButton
                text={job.jobDescription}
                label="Copy Full JD"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              />
              <LinkedInPostButton
                job={job}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-[#0a66c2] text-[#0a66c2] hover:text-white border border-blue-200 hover:border-[#0a66c2] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              />
              <EnhanceJDButton
                job={job}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer"
              />
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50/50 p-6 sm:p-8 rounded-2xl border border-slate-100 font-sans">
            {job.jobDescription}
          </div>
        </div>
      </div>
    </div>
  );
}
