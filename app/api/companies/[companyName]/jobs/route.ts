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

    const jobs = await JobsService.getJobsByCompany(decodedName, false);

    return NextResponse.json({
      companyName: decodedName,
      activeJobCount: jobs.length,
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
