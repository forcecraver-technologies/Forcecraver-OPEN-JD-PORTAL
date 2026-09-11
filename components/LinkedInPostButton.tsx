'use client';

import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import LinkedInPostModal from './LinkedInPostModal';
import { Job } from '@/types/job';

interface LinkedInPostButtonProps {
  job: Job;
  className?: string;
}

export default function LinkedInPostButton({ job, className = '' }: LinkedInPostButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          'inline-flex items-center gap-2 px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer'
        }
        title="Generate & Copy LinkedIn Post"
      >
        <Share2 className="w-4 h-4" />
        <span>LinkedIn Post</span>
      </button>

      <LinkedInPostModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        jdText={job.jobDescription}
        jobTitle={job.jobTitle}
        companyName={job.companyName || ''}
        location={job.location || 'Remote'}
        experience={job.experience || ''}
        skills={job.skills || ''}
        contactPerson={job.contactPerson || ''}
        salaryBudget={job.salaryBudget || ''}
        shiftTiming={job.shiftTiming || ''}
      />
    </>
  );
}
