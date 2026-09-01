import { NextRequest, NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';
import { JobStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, status } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one job ID must be selected.' },
        { status: 400 }
      );
    }

    if (!status || !['ACTIVE', 'CLOSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either ACTIVE or CLOSED.' },
        { status: 400 }
      );
    }

    const result = await JobsService.updateBulkStatus(ids, status as JobStatus);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.count} job(s) to ${status}.`,
      count: result.count,
    });
  } catch (error) {
    console.error('Bulk status update error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk status update.' },
      { status: 500 }
    );
  }
}
