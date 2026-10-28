import { NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await JobsService.getAdminStats();
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats.' },
      { status: 500 }
    );
  }
}
