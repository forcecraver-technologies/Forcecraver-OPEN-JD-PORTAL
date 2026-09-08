import { NextRequest, NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';
import { JobFilterParams } from '@/types/job';

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
      status: (searchParams.get('status') as any) || 'ACTIVE', // Default to ACTIVE for public
      postedDate: (searchParams.get('postedDate') as any) || 'all',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 9,
    };

    const result = await JobsService.getJobs(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job descriptions.' },
      { status: 500 }
    );
  }
}
