'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Job } from '@/types/job';
import NotesModal from '@/components/NotesModal';
import { Building2, MapPin, Briefcase, IndianRupee, Calendar, ArrowRight, CheckCircle2, XCircle, UserCheck, ShieldCheck, StickyNote, Clock, ExternalLink } from 'lucide-react';
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
  const isUanRequired = job.uan === 'Required';
  const [isNotesOpen, setIsNotesOpen] = useState(false);

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

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {job.interviews && job.interviews.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs animate-pulse">
                <span>🎯</span>
                <span>{job.interviews.length} Scheduled</span>
              </span>
            )}

            {isUanRequired ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                UAN Required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                UAN Not Req.
              </span>
            )}

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
        </div>

        {/* Job Title */}
        <Link href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer">
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

          <div className="flex items-center gap-1.5 text-slate-600 truncate">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{job.shiftTiming || 'Day Shift (India)'}</span>
          </div>

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

        {/* Scheduled Interview Section */}
        {job.interviews && job.interviews.length > 0 && (
          <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-700 text-white shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Interview Scheduled ({job.interviews.length})
              </span>
              <span className="text-[11px] font-semibold text-emerald-800">
                {job.interviews[0].status || 'Scheduled'}
              </span>
            </div>

            <div className="space-y-1.5 pt-0.5">
              {job.interviews.map((intv) => {
                const interviewPortalUrl = process.env.NEXT_PUBLIC_INTERVIEW_PORTAL_URL || 'http://localhost:3001';
                const slotUrl = `${interviewPortalUrl}/slots/${encodeURIComponent(intv.referenceCode)}`;
                const intvDate = new Date(intv.interviewDate);
                const formattedIntvDate = !isNaN(intvDate.getTime()) ? format(intvDate, 'MMM d') : '';

                return (
                  <a
                    key={intv.id}
                    href={slotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 text-xs text-slate-800 hover:text-emerald-700 transition-all group/cand shadow-2xs"
                    title={`Click to open ${intv.candidate?.name}'s interview slot in Interview Portal`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold truncate text-slate-900 group-hover/cand:text-emerald-700">
                        {intv.candidate?.name || 'Candidate'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        ({intv.referenceCode})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-emerald-700 font-medium text-[11px]">
                      {formattedIntvDate && <span>{formattedIntvDate} • {intv.startTime}</span>}
                      <ExternalLink className="w-3 h-3 text-emerald-600 group-hover/cand:translate-x-0.5 group-hover/cand:-translate-y-0.5 transition-transform" />
                    </div>
                  </a>
                );
              })}
            </div>
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
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            Ref: #{job.id.slice(0, 8)}
          </span>
          {job.notes && job.notes.trim() && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsNotesOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-all cursor-pointer shadow-2xs group/btn"
              title="Click to view notes"
            >
              <StickyNote className="w-3 h-3 text-blue-600 group-hover/btn:scale-110 transition-transform" />
              <span>Notes</span>
            </button>
          )}
        </div>

        <Link
          href={`/jobs/${job.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
        >
          <span>View JD</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Notes Modal */}
      <NotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        title={job.jobTitle}
        company={job.companyName}
        notes={job.notes}
      />
    </div>
  );
}
