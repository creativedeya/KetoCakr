import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const MK = process.env.MAILERLITE_API_KEY!;
  const MG = process.env.MAILERLITE_GROUP_ID!;

  try {
    const r = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MK}`,
      },
      body: JSON.stringify({ email, groups: [MG] }),
    });
    if (!r.ok) throw new Error('MailerLite error');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
