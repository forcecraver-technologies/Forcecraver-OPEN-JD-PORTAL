'use client';

import React, { useState, useEffect } from 'react';
import { JobFilterParams } from '@/types/job';
import { Filter, X, RotateCcw, Building2, MapPin, Briefcase, Calendar, Check, Layers } from 'lucide-react';

interface JobFiltersProps {
  filters: JobFilterParams;
  onApplyFilters: (newFilters: JobFilterParams) => void;
  onClearFilters: () => void;
  availableCompanies?: string[];
  isAdmin?: boolean;
}

export default function JobFilters({
  filters,
  onApplyFilters,
  onClearFilters,
  availableCompanies = [],
  isAdmin = false,
}: JobFiltersProps) {
  const [localFilters, setLocalFilters] = useState<JobFilterParams>(filters);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (field: keyof JobFilterParams, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onApplyFilters(localFilters);
    setIsOpenMobile(false);
  };

  const handleClear = () => {
    setLocalFilters({
      status: isAdmin ? 'ALL' : 'ACTIVE',
      postedDate: 'all',
      page: 1,
    });
    onClearFilters();
    setIsOpenMobile(false);
  };

  const hasActiveFilters = Boolean(
    localFilters.company ||
    localFilters.title ||
    localFilters.skills ||
    localFilters.experience ||
    localFilters.location ||
    (localFilters.status && (isAdmin ? localFilters.status !== 'ALL' : localFilters.status !== 'ACTIVE')) ||
    (localFilters.postedDate && localFilters.postedDate !== 'all')
  );

  const filterContent = (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-base">Filter Jobs</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Company Filter */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          Company
        </label>
        {availableCompanies.length > 0 ? (
          <select
            value={localFilters.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option value="">All Companies</option>
            {availableCompanies.map((comp) => (
              <option key={comp} value={comp}>
                {comp}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="e.g. Novigo, ABC Tech"
            value={localFilters.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        )}
      </div>

      {/* Job Title Filter */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          Job Title
        </label>
        <input
          type="text"
          placeholder="e.g. Java Developer"
          value={localFilters.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>

      {/* Location Filter */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          Location
        </label>
        <input
          type="text"
          placeholder="e.g. Ahmedabad, Bengaluru, Remote"
          value={localFilters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>

      {/* Skills Filter */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          Required Skills
        </label>
        <input
          type="text"
          placeholder="e.g. React, Spring Boot, AWS"
          value={localFilters.skills || ''}
          onChange={(e) => handleChange('skills', e.target.value)}
          className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>

      {/* Experience Filter */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          Experience
        </label>
        <select
          value={localFilters.experience || ''}
          onChange={(e) => handleChange('experience', e.target.value)}
          className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
        >
          <option value="">Any Experience</option>
          <option value="1-3">1-3 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5-8">5-8 years</option>
          <option value="7-10">7-10 years</option>
          <option value="10+">10+ years</option>
        </select>
      </div>

      {/* Status Filter (Active, Closed, All) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleChange('status', 'ACTIVE')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              (localFilters.status || 'ACTIVE') === 'ACTIVE'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => handleChange('status', 'CLOSED')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              localFilters.status === 'CLOSED'
                ? 'bg-slate-800 border-slate-900 text-white font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {/* Posted Date Options */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          Posted Date
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
          ].map((item) => {
            const isSelected = (localFilters.postedDate || 'all') === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleChange('postedDate', item.id)}
                className={`px-3 py-1.5 text-xs rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Actions */}
      <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleApply()}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Apply Filters
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset All
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setIsOpenMobile(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm font-semibold text-slate-800 text-sm"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filters & Refinements</span>
          </div>
          {hasActiveFilters && (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          )}
        </button>
      </div>

      {/* Desktop Sidebar Panel */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          {filterContent}
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Modal */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpenMobile(false)}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-white shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h3 className="font-bold text-slate-900 text-lg">Filters</h3>
                <button
                  type="button"
                  onClick={() => setIsOpenMobile(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
