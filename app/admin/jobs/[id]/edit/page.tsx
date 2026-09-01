import React from 'react';
import { notFound } from 'next/navigation';
import { JobsService } from '@/services/jobs.service';
import JobForm from '@/components/admin/JobForm';
import { Edit3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditJobPageProps) {
  const { id } = await params;
  const job = await JobsService.getJobById(id);
  if (!job) return { title: 'Edit Job | Open JD Portal' };
  return {
    title: `Edit ${job.jobTitle} (${job.companyName}) | Open JD Portal Admin`,
  };
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const job = await JobsService.getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Edit3 className="w-4 h-4" />
            Update Record
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Edit Job Description
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Editing {job.jobTitle} at {job.companyName}
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

      {/* Reusable Form in Edit Mode */}
      <JobForm initialJob={job} mode="edit" />
    </div>
  );
}
