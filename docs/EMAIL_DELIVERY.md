# JobPulse authentication email delivery — production checklist

The Supabase built-in mailer permits **2 Auth messages per hour per project** and may restrict recipients to project team members. This is a provider-level quota, not a React/Next.js bug. When exceeded, `auth/v1/signup` returns HTTP 429, code `over_email_send_rate_limit`.

## Required owner configuration (no SMTP passwords in GitHub)

1. Choose an email service with SMTP access: e.g. Resend, Brevo, AWS SES, or Postmark. Use a verified sending domain and a sender such as `no-reply@auth.example.com`.
2. In the Supabase dashboard for `xnmjjdezdbsjcbgqmvyk`, open **Authentication → SMTP Settings**. Enable **Custom SMTP** and enter the provider's host, port, username, password, verified sender and name.
3. In **Authentication → Rate Limits**, increase the project email quota to a reasonable, provider-backed level after SMTP is set up. The built-in 2-per-hour quota cannot be raised by increasing the sign-up request limit.
4. In **Authentication → URL Configuration**, configure **Site URL** `https://jobpulse-v3-web.onrender.com` and allow `https://jobpulse-v3-web.onrender.com/auth/callback` as a redirect.
5. Keep **Confirm email** ON, check sender-domain SPF/DKIM/DMARC, and test with one email you control. Avoid repeated registration attempts during testing.
6. Set up monitoring for Auth 429/500 errors and track email deliverability through your provider.

**Do not** disable email confirmations on the publicly deployed site to work around this limit: unverified addresses could then be accepted as confirmed. **Do not** hardcode SMTP credentials or service-role keys in browser code or source control.

For automated end-to-end browser tests, mock the Supabase 429 response to test user feedback; use local mail capture or a disposable account when genuine delivery must be tested.

Documentation:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/rate-limits
- https://supabase.com/docs/guides/auth/testing-auth-flows
