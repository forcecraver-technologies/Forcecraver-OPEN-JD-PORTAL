import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'slate' | 'amber' | 'purple';
  subtext?: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  slate: {
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-600',
    badge: 'bg-slate-200 text-slate-800',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800',
  },
};

export default function AdminStatsCard({
  title,
  value,
  icon: Icon,
  color,
  subtext,
}: AdminStatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-slate-500 font-medium">{subtext}</p>}
      </div>

      <div className={`w-13 h-13 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center p-3.5 shadow-xs`}>
        <Icon className="w-7 h-7" />
      </div>
    </div>
  );
}
