'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, StickyNote, Building2, Briefcase } from 'lucide-react';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  company?: string;
  notes?: string | null;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  title,
  company,
  notes,
}) => {
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    if (!notes) return;
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = notes;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-modal-title"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <h3 id="notes-modal-title" className="text-xl font-extrabold text-slate-900 tracking-tight">
                Job Notes & Instructions
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                {company && (
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {company}
                  </span>
                )}
                {company && title && <span className="text-slate-300">•</span>}
                {title && (
                  <span className="flex items-center gap-1 text-slate-600 truncate max-w-[220px]">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {title}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {notes && notes.trim() ? (
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-blue-100 selection:text-blue-900 shadow-2xs">
              {notes}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              No notes available for this position.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          {notes && notes.trim() ? (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 shadow-2xs transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Notes</span>
                </>
              )}
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
