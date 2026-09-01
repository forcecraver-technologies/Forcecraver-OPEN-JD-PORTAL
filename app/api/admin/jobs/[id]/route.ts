import { NextRequest, NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';
import { validateJobInput } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await JobsService.getJobById(id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job description not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Admin error fetching single job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job description.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { isValid, errors } = validateJobInput(body);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    const updatedJob = await JobsService.updateJob(id, body);

    return NextResponse.json({
      success: true,
      message: 'Job description updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job description.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await JobsService.deleteJob(id);

    return NextResponse.json({
      success: true,
      message: 'Job description deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job description.' },
      { status: 500 }
    );
  }
}
