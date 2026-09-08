import { NextRequest, NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyName: string }> }
) {
  try {
    const { companyName } = await params;
    const decodedName = decodeURIComponent(companyName);

    if (!decodedName) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const includeClosed = searchParams.get('includeClosed') === 'true';

    const jobs = await JobsService.getJobsByCompany(decodedName, includeClosed);

    return NextResponse.json({
      companyName: decodedName,
      activeJobCount: jobs.filter((j) => j.status === 'ACTIVE').length,
      closedJobCount: jobs.filter((j) => j.status === 'CLOSED').length,
      totalCount: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company jobs.' },
      { status: 500 }
    );
  }
}
