import { NextRequest, NextResponse } from 'next/server';
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

export async function DELETE(request: NextRequest) {
  try {
    let companyName: string | null = null;

    // Check query params first
    companyName = request.nextUrl.searchParams.get('companyName');

    // Or check request body
    if (!companyName) {
      try {
        const body = await request.json();
        companyName = body.companyName;
      } catch {
        // No body
      }
    }

    if (!companyName || !companyName.trim()) {
      return NextResponse.json(
        { error: 'Company name is required.' },
        { status: 400 }
      );
    }

    const trimmedName = companyName.trim();
    const result = await JobsService.deleteCompany(trimmedName);

    return NextResponse.json({
      success: true,
      message: `Deleted company "${trimmedName}" and all ${result.count} associated job descriptions.`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company.' },
      { status: 500 }
    );
  }
}
