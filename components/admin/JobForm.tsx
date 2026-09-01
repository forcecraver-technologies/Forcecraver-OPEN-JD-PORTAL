'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Job } from '@/types/job';
import { JobInput, validateJobInput } from '@/lib/validations';
import { parseRawJobDescription } from '@/lib/jdParser';
import {
  Building2,
  Briefcase,
  MapPin,
  IndianRupee,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Save,
  AlertCircle,
  Sparkles,
  ClipboardPaste,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';

interface JobFormProps {
  initialJob?: Job | null;
  mode: 'create' | 'edit';
}

export default function JobForm({ initialJob, mode }: JobFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCompany = searchParams?.get('company') || '';

  const defaultPostedDate = initialJob
    ? format(new Date(initialJob.postedDate), 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd');

  const [rawJdText, setRawJdText] = useState('');
  const [parseNotice, setParseNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState<JobInput>({
    companyName: initialJob?.companyName || prefilledCompany || '',
    contactPerson: initialJob?.contactPerson || '',
    jobTitle: initialJob?.jobTitle || '',
    skills: initialJob?.skills || '',
    experience: initialJob?.experience || '',
    location: initialJob?.location || '',
    salaryBudget: initialJob?.salaryBudget || '',
    jobDescription: initialJob?.jobDescription || '',
    postedDate: defaultPostedDate,
    status: (initialJob?.status as any) || 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: keyof JobInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleParseRawJd = (textToParse?: string) => {
    const text = textToParse !== undefined ? textToParse : rawJdText;
    if (!text || !text.trim()) {
      setParseNotice('Please paste some text in the box first.');
      return;
    }

    const parsed = parseRawJobDescription(text);
    let extractedCount = 0;

    setFormData((prev) => {
      const next = { ...prev };
      if (parsed.companyName) {
        next.companyName = parsed.companyName;
        extractedCount++;
      }
      if (parsed.contactPerson) {
        next.contactPerson = parsed.contactPerson;
        extractedCount++;
      }
      if (parsed.jobTitle) {
        next.jobTitle = parsed.jobTitle;
        extractedCount++;
      }
      if (parsed.location) {
        next.location = parsed.location;
        extractedCount++;
      }
      if (parsed.experience) {
        next.experience = parsed.experience;
        extractedCount++;
      }
      if (parsed.salaryBudget) {
        next.salaryBudget = parsed.salaryBudget;
        extractedCount++;
      }
      if (parsed.skills) {
        next.skills = parsed.skills;
        extractedCount++;
      }
      if (parsed.jobDescription) {
        next.jobDescription = parsed.jobDescription;
        extractedCount++;
      }
      return next;
    });

    setErrors({});
    setParseNotice(`✨ Successfully extracted details into the form below! All fields remain fully editable.`);
  };

  const handleRawTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawJdText(val);
  };

  const handleClearRawJd = () => {
    setRawJdText('');
    setParseNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    const validation = validateJobInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSubmitting(true);
      const url = mode === 'create' ? '/api/admin/jobs' : `/api/admin/jobs/${initialJob?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Failed to save job description.');
        if (data.errors) setErrors(data.errors);
        return;
      }

      setSuccessMessage(
        mode === 'create'
          ? 'Job description published successfully!'
          : 'Job description updated successfully!'
      );

      setTimeout(() => {
        router.push('/admin/jobs');
        router.refresh();
      }, 900);
    } catch (err) {
      console.error('Error saving job:', err);
      setServerError('An unexpected network or server error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Alert Banners */}
      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage} Redirecting to job listings...</span>
        </div>
      )}

      {/* 1. FIRST OPTION: PASTE RAW JD SMART AUTO-FILLER */}
      <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white rounded-3xl border-2 border-blue-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>Option 1: Paste Raw JD</span>
                <span className="text-[11px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  Smart Auto-Fill
                </span>
              </h3>
              <p className="text-xs text-slate-600">
                Paste any unstructured job description text to automatically extract and populate the form fields below.
              </p>
            </div>
          </div>

          {rawJdText && (
            <button
              type="button"
              onClick={handleClearRawJd}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Text
            </button>
          )}
        </div>

        <div className="space-y-3">
          <textarea
            rows={5}
            value={rawJdText}
            onChange={handleRawTextChange}
            placeholder="Paste your raw job description here (e.g. from LinkedIn, Email, Word Document, or Client Message)..."
            className="w-full p-4 rounded-2xl border border-blue-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none leading-relaxed transition-all shadow-2xs font-sans"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleParseRawJd()}
              disabled={!rawJdText.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Fill Form from JD</span>
            </button>

            <span className="text-[11px] text-slate-500 font-medium">
              ⚡ Rule-based parser extracts Title, Company, Skills, Experience, Location & Salary.
            </span>
          </div>

          {parseNotice && (
            <div className="p-3.5 rounded-xl bg-blue-100/70 border border-blue-300 text-blue-900 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium">{parseNotice}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. BASIC DETAILS (AUTO-FILLED & FULLY EDITABLE) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Job Specifications (Editable)
          </h3>
          <span className="text-xs text-slate-400 font-medium">* Required fields</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Company Name <span className="text-rose-500">*</span>
              </label>
              {prefilledCompany && formData.companyName === prefilledCompany && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Pre-selected from Company
                </span>
              )}
            </div>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. Novigo, ABC Technologies"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all ${
                  errors.companyName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.companyName && <p className="text-xs text-rose-500">{errors.companyName}</p>}
          </div>

          {/* Handled By / Contact Person */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Handled By / Contact Person
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. Sarthak, Rahul, HR Team"
                value={formData.contactPerson || ''}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Job Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. Senior Java Backend Developer"
                value={formData.jobTitle}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all ${
                  errors.jobTitle ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.jobTitle && <p className="text-xs text-rose-500">{errors.jobTitle}</p>}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. Ahmedabad, Bengaluru, Remote"
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Experience
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. 3-5 years, 5+ years"
                value={formData.experience || ''}
                onChange={(e) => handleChange('experience', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Salary / Budget */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Salary / Budget
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. 12 - 18 LPA, Competitive"
                value={formData.salaryBudget || ''}
                onChange={(e) => handleChange('salaryBudget', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Posted Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Posted Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="date"
                value={formData.postedDate}
                onChange={(e) => handleChange('postedDate', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all ${
                  errors.postedDate ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.postedDate && <p className="text-xs text-rose-500">{errors.postedDate}</p>}
          </div>

          {/* Skills */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Java, Spring Boot, PostgreSQL, Docker, Microservices"
              value={formData.skills || ''}
              onChange={(e) => handleChange('skills', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Status Selection */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Status <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                <input
                  type="radio"
                  name="status"
                  value="ACTIVE"
                  checked={formData.status === 'ACTIVE'}
                  onChange={() => handleChange('status', 'ACTIVE')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
                <span className="text-xs text-slate-500">(Visible in public searches)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                <input
                  type="radio"
                  name="status"
                  value="CLOSED"
                  checked={formData.status === 'CLOSED'}
                  onChange={() => handleChange('status', 'CLOSED')}
                  className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                />
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                  CLOSED
                </span>
                <span className="text-xs text-slate-500">(Hidden from default active searches)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FULL JOB DESCRIPTION CONTENT */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Job Description Content <span className="text-rose-500">*</span>
        </h3>

        <div className="space-y-1.5">
          <textarea
            rows={12}
            placeholder="Enter the complete job description, key responsibilities, qualifications, and benefits..."
            value={formData.jobDescription}
            onChange={(e) => handleChange('jobDescription', e.target.value)}
            className={`w-full p-4 rounded-xl border text-sm text-slate-900 font-sans leading-relaxed bg-slate-50/40 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all ${
              errors.jobDescription ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
            }`}
          />
          {errors.jobDescription && (
            <p className="text-xs text-rose-500">{errors.jobDescription}</p>
          )}
        </div>
      </div>

      {/* FORM ACTION BUTTONS */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/jobs')}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? 'Saving...' : mode === 'create' ? 'Save JD' : 'Update JD'}
        </button>
      </div>
    </form>
  );
}
