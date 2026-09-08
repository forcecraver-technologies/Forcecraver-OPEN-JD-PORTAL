import { NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';

export async function GET() {
  try {
    const companies = await JobsService.getActiveCompanies();
    return NextResponse.json(
      { companies },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching active companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies.' },
      { status: 500 }
    );
  }
}
