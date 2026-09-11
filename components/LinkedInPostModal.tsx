'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  User,
  Mail,
  Phone,
  Flame,
  Briefcase,
  ExternalLink,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  generateLinkedInPost,
  TemplateStyle,
  extractRoleFromText,
  extractExperienceFromText,
  cleanJobTitle,
} from '@/lib/linkedinPostGenerator';

interface LinkedInPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  jdText?: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  experience?: string;
  skills?: string[] | string;
  contactPerson?: string;
  salaryBudget?: string;
  shiftTiming?: string;
}

export const LinkedInPostModal: React.FC<LinkedInPostModalProps> = ({
  isOpen,
  onClose,
  jdText = '',
  jobTitle = '',
  companyName = '',
  location = '',
  experience = '',
  skills = '',
  contactPerson = '',
  salaryBudget = '',
  shiftTiming = '',
}) => {
  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>('engaging');
  // Always default strictly to [enter your name]; Priyanka and Sakshi handle clients, not talent acquisition
  const [recruiterName, setRecruiterName] = useState('[enter your name]');
  const [recruiterEmail, setRecruiterEmail] = useState('[enter your email]');
  const [recruiterPhone, setRecruiterPhone] = useState('[enter your phone]');
  const [noticePeriod, setNoticePeriod] = useState('Immediate to 15 Days Preferred');
  const [customLocation, setCustomLocation] = useState(location || 'Remote (India / Global)');
  const [postContent, setPostContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCustomizers, setShowCustomizers] = useState(false);

  // Sync initial location when prop arrives
  useEffect(() => {
    if (location && (!customLocation || customLocation === 'Remote (India / Global)')) {
      setCustomLocation(location);
    }
  }, [location]);

  // Generate post when inputs or template style changes
  useEffect(() => {
    if (isOpen) {
      const generated = generateLinkedInPost(jdText, {
        title: jobTitle,
        companyName: companyName,
        location: customLocation,
        experience: experience,
        skills: skills,
        salary: salaryBudget,
        shiftTiming: shiftTiming || 'Day Shift (India)',
        noticePeriod: noticePeriod,
        recruiterName: recruiterName,
        recruiterEmail: recruiterEmail,
        recruiterPhone: recruiterPhone,
        templateStyle: templateStyle,
      });
      setPostContent(generated);
    }
  }, [
    isOpen,
    jdText,
    jobTitle,
    companyName,
    customLocation,
    experience,
    skills,
    salaryBudget,
    shiftTiming,
    noticePeriod,
    recruiterName,
    recruiterEmail,
    recruiterPhone,
    templateStyle,
  ]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const detectedRole = cleanJobTitle(jobTitle || extractRoleFromText(jdText), companyName);
  const detectedExp = experience || extractExperienceFromText(jdText);

  const handleCopy = async () => {
    if (!postContent) return;
    try {
      await navigator.clipboard.writeText(postContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = postContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLinkedIn = async () => {
    await handleCopy();
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
  };

  const handleResetToDefault = () => {
    setRecruiterName('[enter your name]');
    setRecruiterEmail('[enter your email]');
    setRecruiterPhone('[enter your phone]');
    setNoticePeriod('Immediate to 15 Days Preferred');
    setTemplateStyle('engaging');
    const regenerated = generateLinkedInPost(jdText, {
      title: jobTitle,
      companyName: companyName,
      location: location || 'Remote (India / Global)',
      experience: experience,
      skills: skills,
      salary: salaryBudget,
      shiftTiming: shiftTiming || 'Day Shift (India)',
      noticePeriod: 'Immediate to 15 Days Preferred',
      recruiterName: '[enter your name]',
      recruiterEmail: '[enter your email]',
      recruiterPhone: '[enter your phone]',
      templateStyle: 'engaging',
    });
    setPostContent(regenerated);
  };

  const charCount = postContent.length;
  const wordCount = postContent.trim() ? postContent.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="linkedin-modal-title"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 py-4 sm:py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#0a66c2]/10 border border-[#0a66c2]/20 flex items-center justify-center text-[#0a66c2] shrink-0 shadow-2xs font-black text-xl">
              in
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="linkedin-modal-title" className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Enhanced LinkedIn Post
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#0a66c2] border border-blue-200">
                  AI Formatted
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Engineered for maximum engagement, clear CTA, and professional LinkedIn outreach.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-700 font-sans flex-1">
          {/* Quick Details Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200/80">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate max-w-[200px]">{detectedRole}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{detectedExp}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{customLocation}</span>
            </span>
          </div>

          {/* Template Style Selector */}
          <div className="p-1.5 bg-slate-100/90 rounded-2xl flex items-center gap-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setTemplateStyle('engaging')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                templateStyle === 'engaging'
                  ? 'bg-white text-[#0a66c2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Viral / Engaging</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 hidden sm:inline">
                Best
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTemplateStyle('professional')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                templateStyle === 'professional'
                  ? 'bg-white text-[#0a66c2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Professional</span>
            </button>

            <button
              type="button"
              onClick={() => setTemplateStyle('urgent')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                templateStyle === 'urgent'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Urgent / Punchy</span>
            </button>
          </div>

          {/* Customizer toggle & Reset */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowCustomizers(!showCustomizers)}
              className="text-xs font-bold text-[#0a66c2] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showCustomizers ? 'Hide Details Customizer' : 'Customize Name, Email, WhatsApp & Location'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
              title="Reset fields to original defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Dynamic Customizers Panel */}
          {showCustomizers && (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-600" />
                    <span>Recruiter Name (Follow line)</span>
                  </label>
                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    placeholder="[enter your name]"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-blue-100 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-600" />
                    <span>Application Email</span>
                  </label>
                  <input
                    type="text"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    placeholder="[enter your email]"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-blue-100 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-600" />
                    <span>WhatsApp / Phone Contact</span>
                  </label>
                  <input
                    type="text"
                    value={recruiterPhone}
                    onChange={(e) => setRecruiterPhone(e.target.value)}
                    placeholder="[enter your phone]"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-blue-100 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>Notice Period</span>
                  </label>
                  <input
                    type="text"
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    placeholder="Immediate to 15 Days Preferred"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-blue-100 text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Formatted Post Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-800">Generated Post Content:</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {charCount} chars &bull; {wordCount} words
              </span>
            </div>

            <textarea
              rows={14}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-sm text-slate-800 font-sans leading-relaxed focus:bg-white focus:border-[#0a66c2] focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-inner resize-y"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Paste directly into LinkedIn &bull; Clean formatting preserved
          </span>

          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleOpenLinkedIn}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-[#0a66c2] border border-[#0a66c2]/40 rounded-xl text-xs sm:text-sm font-bold shadow-2xs hover:shadow transition-all cursor-pointer"
              title="Copy text & Open LinkedIn in a new tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Copy & Open LinkedIn</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#0a66c2] hover:bg-[#004182] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInPostModal;
