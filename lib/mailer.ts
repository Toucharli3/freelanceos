/**
 * Mailer unifié — supporte Resend ET SMTP (Gmail, Brevo, etc.)
 *
 * Priorité :
 * 1. Si RESEND_API_KEY est défini → utilise Resend
 * 2. Sinon si SMTP_HOST est défini → utilise nodemailer (Gmail, Brevo…)
 * 3. Sinon → log l'email en console (dev)
 */

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL ??
    process.env.SMTP_FROM ??
    'noreply@freelanceos.app'

  // ── 1. Resend ──────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    })
    if (error) throw new Error(error.message)
    return
  }

  // ── 2. SMTP (nodemailer) ───────────────────────────────────
  if (process.env.SMTP_HOST) {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    await transporter.sendMail({
      from: `FreelanceOS <${from}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    })
    return
  }

  // ── 3. Dev fallback ────────────────────────────────────────
  console.log('📧 [MAILER - no provider configured]')
  console.log('To:', opts.to)
  console.log('Subject:', opts.subject)
  console.log('Body:', opts.text)
}
