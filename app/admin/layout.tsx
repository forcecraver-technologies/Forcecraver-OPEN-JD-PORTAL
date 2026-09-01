import React from 'react';
import AdminNavbar from '@/components/admin/AdminNavbar';

export const metadata = {
  title: 'Admin Management Console | Open JD Portal',
  description: 'Manage, create, update, and search all job descriptions.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      <AdminNavbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
