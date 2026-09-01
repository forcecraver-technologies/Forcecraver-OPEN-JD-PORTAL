'use client';

import React from 'react';
import Link from 'next/link';
import { Job } from '@/types/job';
import { Building2, MapPin, Briefcase, IndianRupee, Calendar, ArrowRight, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const parsedDate = new Date(job.postedDate);
  let formattedDate = 'Recently';

  if (!isNaN(parsedDate.getTime())) {
    if (isToday(parsedDate)) {
      formattedDate = 'Posted Today';
    } else if (isYesterday(parsedDate)) {
      formattedDate = 'Posted Yesterday';
    } else {
      formattedDate = format(parsedDate, 'MMM d, yyyy');
    }
  }

  const skillsList = job.skills
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const isActive = job.status === 'ACTIVE';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top meta row: Company & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link
            href={`/companies/${encodeURIComponent(job.companyName)}`}
            className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium text-sm transition-colors group/company"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover/company:bg-blue-50 group-hover/company:text-blue-600 transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800 group-hover/company:text-blue-600 underline-offset-2 hover:underline">
              {job.companyName}
            </span>
          </Link>

          {isActive ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <XCircle className="w-3 h-3" />
              Closed
            </span>
          )}
        </div>

        {/* Job Title */}
        <Link href={`/jobs/${job.id}`}>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {job.jobTitle}
          </h3>
        </Link>

        {/* Key Job Attributes Grid */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600">
          {job.location && (
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
          )}

          {job.experience && (
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{job.experience}</span>
            </div>
          )}

          {job.salaryBudget && (
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <IndianRupee className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate font-medium text-slate-700">{job.salaryBudget}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-500 truncate">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
        </div>

        {/* Handled By Badge */}
        {job.contactPerson && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-50 text-slate-700 border border-slate-200/80">
            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Handled by:</span>
            <span className="font-semibold text-slate-800">{job.contactPerson}</span>
          </div>
        )}

        {/* Skills Pills */}
        {skillsList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skillsList.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200/70"
              >
                {skill}
              </span>
            ))}
            {skillsList.length > 4 && (
              <span className="inline-block px-2 py-1 rounded-md text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100">
                +{skillsList.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">
          Ref: #{job.id.slice(0, 8)}
        </span>

        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
        >
          <span>View JD</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
