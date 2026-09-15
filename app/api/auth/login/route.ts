import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { validateLoginInput } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isValid, errors } = validateLoginInput(body);

    if (!isValid) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    const { email, password } = body;

    const admin = email && email.trim()
      ? await prisma.admin.findUnique({
          where: { email: email.trim().toLowerCase() },
        })
      : await prisma.admin.findFirst();

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = await signToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });

    // Check if HTTPS is actually used (to prevent dropping cookie on HTTP public / LAN networks)
    const isHttps = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during login.' },
      { status: 500 }
    );
  }
}
