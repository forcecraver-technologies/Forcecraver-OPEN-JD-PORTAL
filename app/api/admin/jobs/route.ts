import { NextRequest, NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';
import { validateJobInput } from '@/lib/validations';
import { JobFilterParams } from '@/types/job';

export const dynamic = 'force-dynamic';

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
      status: (searchParams.get('status') as any) || 'ALL', // Admin views ALL by default
      uan: searchParams.get('uan') || undefined,
      shiftTiming: searchParams.get('shiftTiming') || undefined,
      postedDate: (searchParams.get('postedDate') as any) || 'all',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 15,
    };

    const result = await JobsService.getJobs(filters);
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Admin error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job descriptions.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isValid, errors } = validateJobInput(body);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    const createdJob = await JobsService.createJob(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Job description created successfully',
        job: createdJob,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job description.' },
      { status: 500 }
    );
  }
}
