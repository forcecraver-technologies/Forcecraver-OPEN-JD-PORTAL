import { NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';

export async function GET() {
  try {
    const companies = await JobsService.getAdminCompaniesWithStats();
    return NextResponse.json({
      companies,
      totalCompanies: companies.length,
    });
  } catch (error) {
    console.error('Error fetching admin companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
