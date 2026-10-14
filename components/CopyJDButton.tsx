'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyJDButtonProps {
  text?: string | null;
  className?: string;
  label?: string;
  copiedLabel?: string;
}

export default function CopyJDButton({
  text,
  className,
  label = 'Copy JD',
  copiedLabel = 'Copied!',
}: CopyJDButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!text) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers or non-secure contexts
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const defaultClasses = copied
    ? 'inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs'
    : 'inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer';

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className ? (copied ? `${className} !bg-emerald-50 !text-emerald-700 !border-emerald-300` : className) : defaultClasses}
      title={copied ? 'Job description copied!' : 'Copy complete job description'}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50 duration-200" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-500" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
