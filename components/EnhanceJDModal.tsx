'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Download,
  AlertCircle,
  FileText,
  Zap,
  PenLine,
  RotateCcw,
} from 'lucide-react';
import { Job } from '@/types/job';

interface EnhanceJDModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

export default function EnhanceJDModal({ isOpen, onClose, job }: EnhanceJDModalProps) {
  const [enhancedJD, setEnhancedJD] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'enhanced' | 'original'>('enhanced');

  // Track the current job being processed to prevent stale data
  const currentJobIdRef = useRef<string>('');
  // Track the original raw AI output for this job in case the user wants to revert manual edits
  const rawAiOutputRef = useRef<string>('');

  const runEnhancement = useCallback(async (targetJob: Job) => {
    if (!targetJob?.jobDescription) {
      setError('No job description found to enhance.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setEnhancedJD('');
    rawAiOutputRef.current = '';
    setCopied(false);
    setActiveTab('enhanced');

    try {
      const res = await fetch('/api/jobs/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: targetJob.jobDescription,
          jobTitle: targetJob.jobTitle || '',
          companyName: targetJob.companyName || '',
        }),
      });

      const data = await res.json();

      // Ensure that we only update state if the job hasn't switched
      if (currentJobIdRef.current === targetJob.id) {
        if (!res.ok) {
          throw new Error(data.error || 'Failed to enhance job description.');
        }
        const output = data.enhancedJD || '';
        rawAiOutputRef.current = output;
        setEnhancedJD(output);
      }
    } catch (err: any) {
      if (currentJobIdRef.current === targetJob.id) {
        setError(err?.message || 'Something went wrong while enhancing the JD. Please try again.');
      }
    } finally {
      if (currentJobIdRef.current === targetJob.id) {
        setLoading(false);
      }
    }
  }, []);

  // When modal opens or job changes: reset completely and immediately trigger enhancement
  useEffect(() => {
    if (isOpen && job?.id) {
      currentJobIdRef.current = job.id;
      runEnhancement(job);
    } else {
      currentJobIdRef.current = '';
      rawAiOutputRef.current = '';
      setEnhancedJD('');
      setError(null);
      setLoading(false);
      setCopied(false);
    }
  }, [isOpen, job?.id, runEnhancement]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const textToCopy = activeTab === 'enhanced' ? enhancedJD : job.jobDescription;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const content = activeTab === 'enhanced' ? enhancedJD : job.jobDescription;
    if (!content) return;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(job.jobTitle || 'job-description').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-enhanced.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = (text?: string) => (text ? text.trim().split(/\s+/).length : 0);
  const isEdited = rawAiOutputRef.current && enhancedJD !== rawAiOutputRef.current;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50/70 via-white to-indigo-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Enhanced Job Description
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  <Zap className="w-3 h-3 text-purple-600" /> Groq AI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  <PenLine className="w-3 h-3 text-slate-500" /> Editable
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {job.jobTitle} {job.companyName ? `• ${job.companyName}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/30 animate-pulse">
                  <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shadow">
                  <Zap className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  Enhancing Job Description with Groq...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Restructuring responsibilities, organizing technical requirements, and polishing formatting for ATS.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-purple-600 font-semibold bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating in ~1-2 seconds</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm p-4 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-red-900">Could not enhance Job Description</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => runEnhancement(job)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Again
                </button>
              </div>
            </div>
          )}

          {/* Result View */}
          {!loading && !error && enhancedJD && (
            <div className="space-y-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-2.5 pb-2 border-b border-slate-100">
                {/* Tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveTab('enhanced')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeTab === 'enhanced'
                          ? 'bg-white text-purple-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Enhanced JD (Editable)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('original')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeTab === 'original'
                          ? 'bg-white text-slate-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Original JD</span>
                    </button>
                  </div>

                  {activeTab === 'enhanced' && isEdited && (
                    <button
                      type="button"
                      onClick={() => setEnhancedJD(rawAiOutputRef.current)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-1 rounded-lg transition-all cursor-pointer"
                      title="Revert to original AI output"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Edits</span>
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {wordCount(activeTab === 'enhanced' ? enhancedJD : job.jobDescription)} words
                  </span>

                  <button
                    type="button"
                    onClick={() => runEnhancement(job)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Regenerate with Groq AI"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Download as .txt"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JD</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* JD Content Container (Editable Textarea for Enhanced JD, Read-only view for Original JD) */}
              {activeTab === 'enhanced' ? (
                <div className="relative">
                  <textarea
                    value={enhancedJD}
                    onChange={(e) => setEnhancedJD(e.target.value)}
                    placeholder="Enhanced job description will appear here..."
                    className="w-full min-h-[360px] max-h-[520px] p-4 sm:p-6 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-purple-500 focus:ring-3 focus:ring-purple-100 rounded-2xl font-sans text-xs sm:text-sm text-slate-800 leading-relaxed transition-all outline-none resize-y"
                    rows={18}
                  />
                  <div className="absolute right-3 bottom-3 pointer-events-none">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white/90 border border-slate-200/70 px-2 py-0.5 rounded-md shadow-2xs">
                      <PenLine className="w-2.5 h-2.5" /> You can edit directly
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full min-h-[360px] max-h-[520px] overflow-y-auto p-4 sm:p-6 bg-slate-50/50 border border-slate-200/80 rounded-2xl font-sans text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap select-text">
                  {job.jobDescription}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Job: <strong className="text-slate-700">{job.jobTitle}</strong></span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-purple-600 font-semibold">Groq Powered</span>
            {isEdited && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="text-amber-600 font-medium">Edited</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
