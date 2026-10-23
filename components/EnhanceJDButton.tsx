'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import EnhanceJDModal from './EnhanceJDModal';
import { Job } from '@/types/job';

interface EnhanceJDButtonProps {
  job: Job;
  className?: string;
  label?: string;
}

export default function EnhanceJDButton({
  job,
  className = '',
  label = 'Enhance JD',
}: EnhanceJDButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          'inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer'
        }
        title="Enhance Job Description with AI"
      >
        <Sparkles className="w-4 h-4 shrink-0 opacity-90" />
        <span className="font-bold">{label}</span>
      </button>

      {isOpen && (
        <EnhanceJDModal isOpen={isOpen} onClose={() => setIsOpen(false)} job={job} />
      )}
    </>
  );
}
