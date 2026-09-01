import { NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';

export async function GET() {
  try {
    const stats = await JobsService.getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats.' },
      { status: 500 }
    );
  }
}
