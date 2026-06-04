import { Resend } from "resend";

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "FB Auto Revenue Suite";
const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@fbautorevenuesuite.com";

export async function sendWelcomeEmail(to: string, name: string) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to ${APP_NAME}!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#3B82F6">Welcome to ${APP_NAME}!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining ${APP_NAME}. Your 14-day free trial has started!</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Connect your Facebook Pages</li>
          <li>Schedule posts with AI assistance</li>
          <li>Capture and manage leads</li>
          <li>Track your analytics</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="background:#3B82F6;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
          Get Started
        </a>
        <p style="color:#6B7280;margin-top:32px;font-size:14px">
          If you have any questions, reply to this email or contact our support team.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Reset your ${APP_NAME} password`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#3B82F6">Reset Your Password</h1>
        <p>You requested a password reset. Click the button below to reset your password.</p>
        <p>This link expires in 1 hour.</p>
        <a href="${resetUrl}"
           style="background:#3B82F6;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
          Reset Password
        </a>
        <p style="color:#6B7280;margin-top:32px;font-size:14px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendLeadNotificationEmail(
  to: string,
  leadName: string,
  source: string
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New Lead: ${leadName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#3B82F6">New Lead Captured!</h1>
        <p>A new lead has been captured from ${source}:</p>
        <p><strong>Name:</strong> ${leadName}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads"
           style="background:#3B82F6;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
          View Lead
        </a>
      </div>
    `,
  });
}

export async function sendSubscriptionEmail(
  to: string,
  name: string,
  plan: string,
  action: "upgraded" | "canceled"
) {
  const subject =
    action === "upgraded"
      ? `You've upgraded to ${plan}!`
      : `Your ${plan} subscription has been canceled`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#3B82F6">
          ${action === "upgraded" ? "🎉 Upgrade Successful!" : "Subscription Canceled"}
        </h1>
        <p>Hi ${name},</p>
        <p>
          ${action === "upgraded"
            ? `Your subscription has been upgraded to the <strong>${plan}</strong> plan. You now have access to all ${plan} features!`
            : `Your ${plan} subscription has been canceled. You'll retain access until the end of your billing period.`
          }
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing"
           style="background:#3B82F6;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
          View Billing
        </a>
      </div>
    `,
  });
}
