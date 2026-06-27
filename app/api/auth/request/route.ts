import { Resend } from 'resend';
import { generateMagicToken } from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const raw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }

  const token = await generateMagicToken(raw);
  const origin = new URL(req.url).origin;
  const verifyUrl = `${origin}/api/auth/verify?token=${token}`;

  if (process.env.RESEND_API_KEY) {
    const from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `The Death of Browsing <${from}>`,
      to: [raw],
      subject: 'Your sign-in link',
      html: buildEmail(verifyUrl),
    });
    if (error) {
      console.error('[auth/request] Resend error:', error);
      return Response.json({ error: 'Failed to send email. Try again.' }, { status: 502 });
    }
  } else {
    console.warn('[auth/request] RESEND_API_KEY not set — email not sent');
  }

  // Return the link in dev or when Resend is not configured
  const extra = !process.env.RESEND_API_KEY || process.env.NODE_ENV !== 'production'
    ? { verifyUrl }
    : {};

  return Response.json({ ok: true, ...extra });
}

function buildEmail(url: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#050505;color:#ececec;font-family:Georgia,'Times New Roman',serif;max-width:480px;margin:0 auto;padding:40px 20px">
  <p style="font-family:monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#555;margin:0 0 32px">THE DEATH OF BROWSING</p>
  <p style="font-style:italic;color:#aaa;line-height:1.8;margin:0 0 36px;font-size:15px">One sign-in link. No password.</p>
  <a href="${url}" style="display:inline-block;border:1px solid #ececec;padding:14px 32px;color:#ececec;text-decoration:none;font-family:monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase">Enter</a>
  <p style="color:#333;font-size:11px;margin:48px 0 0;line-height:1.7">Link expires in 15 minutes.<br>If you didn't request this, ignore it.</p>
</body></html>`;
}
