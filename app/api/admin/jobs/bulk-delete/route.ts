import { NextRequest, NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one job ID must be selected for deletion.' },
        { status: 400 }
      );
    }

    const result = await JobsService.deleteBulkJobs(ids);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} job(s).`,
      count: result.count,
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk deletion.' },
      { status: 500 }
    );
  }
}
