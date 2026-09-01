import React from 'react';
import Link from 'next/link';
import { Briefcase, ShieldCheck, Database, Search } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Open JD <span className="text-blue-600">Portal</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Open JD Portal provides a centralized, deterministic, rule-based job description search engine. Powered strictly by PostgreSQL database indexing and keyword matching.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                <Database className="w-3.5 h-3.5 text-blue-600" /> PostgreSQL 17
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                <Search className="w-3.5 h-3.5 text-emerald-600" /> Rule Engine
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Secure Admin
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  All Active Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-blue-600 transition-colors">
                  Browse Companies
                </Link>
              </li>
              <li>
                <Link href="/?search=Today+JDs" className="hover:text-blue-600 transition-colors">
                  Today's JDs
                </Link>
              </li>
              <li>
                <Link href="/?search=Jobs+in+Ahmedabad" className="hover:text-blue-600 transition-colors">
                  Jobs in Ahmedabad
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Administration */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Portal Access</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/admin" className="hover:text-blue-600 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/jobs" className="hover:text-blue-600 transition-colors">
                  Manage Job Descriptions
                </Link>
              </li>
              <li>
                <Link href="/admin/jobs/new" className="hover:text-blue-600 transition-colors">
                  Create New JD
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-blue-600 transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Open JD Portal. All rights reserved.</p>
          <p className="font-mono text-slate-400">Strict Rule-Based Architecture — Zero AI</p>
        </div>
      </div>
    </footer>
  );
}
