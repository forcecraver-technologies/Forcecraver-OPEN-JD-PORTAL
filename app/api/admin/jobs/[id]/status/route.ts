import { NextRequest, NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';
import { JobStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['ACTIVE', 'CLOSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (ACTIVE or CLOSED) is required.' },
        { status: 400 }
      );
    }

    const updatedJob = await JobsService.updateJobStatus(id, status as JobStatus);

    return NextResponse.json({
      success: true,
      message: `Job status updated to ${status}`,
      job: updatedJob,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status.' },
      { status: 500 }
    );
  }
}
