import { NextRequest, NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';
import { JobFilterParams } from '@/types/job';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: JobFilterParams = {
      search: searchParams.get('search') || undefined,
      company: searchParams.get('company') || undefined,
      title: searchParams.get('title') || undefined,
      skills: searchParams.get('skills') || undefined,
      experience: searchParams.get('experience') || undefined,
      location: searchParams.get('location') || undefined,
      status: 'ACTIVE', // Always ACTIVE for public export
      uan: searchParams.get('uan') || undefined,
      shiftTiming: searchParams.get('shiftTiming') || undefined,
      postedDate: (searchParams.get('postedDate') as any) || 'all',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const scope = searchParams.get('scope') || 'current'; // 'current' | 'all' | 'range'
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    let startPage = 1;
    let endPage = 1;

    if (scope === 'current') {
      startPage = currentPage;
      endPage = currentPage;
    } else if (scope === 'all') {
      startPage = 1;
      endPage = 999999;
    } else if (scope === 'range') {
      startPage = Math.max(1, parseInt(searchParams.get('startPage') || '1', 10));
      endPage = Math.max(startPage, parseInt(searchParams.get('endPage') || '1', 10));
    }

    const { jobs } = await JobsService.getJobsForExport(filters, startPage, endPage, limit);

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { error: 'No active job descriptions found matching criteria.' },
        { status: 404 }
      );
    }

    // Build Excel dataset
    const rows = jobs.map((job, index) => {
      const dateStr = job.postedDate
        ? format(new Date(job.postedDate), 'yyyy-MM-dd')
        : '';

      return {
        'S.No': index + 1,
        'Status': 'Active',
        'Company Name': job.companyName,
        'Job Title': job.jobTitle,
        'Shift Timing': job.shiftTiming || 'Day Shift (India)',
        'UAN Requirement': job.uan || 'Not Required',
        'Important Notes': job.notes || '—',
        'Experience': job.experience || '—',
        'Location': job.location || '—',
        'Salary / Budget': job.salaryBudget || '—',
        'Skills': job.skills || '—',
        'Job Description': job.jobDescription || '—',
        'Posted Date': dateStr,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 },  // S.No
      { wch: 14 }, // Status
      { wch: 25 }, // Company Name
      { wch: 30 }, // Job Title
      { wch: 22 }, // Shift Timing
      { wch: 18 }, // UAN Requirement
      { wch: 30 }, // Important Notes
      { wch: 16 }, // Experience
      { wch: 20 }, // Location
      { wch: 18 }, // Salary / Budget
      { wch: 35 }, // Skills
      { wch: 60 }, // Job Description
      { wch: 14 }, // Posted Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Active Job Postings');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Active_Job_Postings_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error in public Excel export:', error);
    return NextResponse.json(
      { error: 'Failed to export job descriptions.' },
      { status: 500 }
    );
  }
}
