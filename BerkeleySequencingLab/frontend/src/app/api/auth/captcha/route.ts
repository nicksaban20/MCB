import { NextResponse } from 'next/server';
import { createCaptchaChallenge } from '@/utils/server-captcha';
import { validateEmail } from '@/utils/security';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'A valid email address is required to generate a challenge.' },
        { status: 400 }
      );
    }

    return NextResponse.json(createCaptchaChallenge(email));
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
