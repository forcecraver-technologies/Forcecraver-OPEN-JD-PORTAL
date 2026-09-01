import { NextRequest, NextResponse } from 'next/server';
import { JobsService } from '@/services/jobs.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, contactPerson } = body;

    if (!companyName || !companyName.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const result = await JobsService.updateCompanyHandler(companyName, contactPerson || '');

    return NextResponse.json({
      success: true,
      message: `Updated handler for ${companyName} (${result.count} JDs updated).`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error updating company handler:', error);
    return NextResponse.json(
      { error: 'Failed to update company handler' },
      { status: 500 }
    );
  }
}
