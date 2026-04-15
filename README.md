# Rentro Auth System (Next.js App Router)

Production-ready multi-provider authentication for a campus marketplace.

## Tech Stack

- Next.js 16 App Router
- Tailwind CSS
- MongoDB + Mongoose
- Firebase Authentication (Google popup, Phone OTP, Email link)
- NextAuth.js (optional legacy OAuth/session support)
- Nodemailer (Email OTP)
- JWT for OTP sessions

## Implemented Features

1. Phone OTP login with Firebase client OTP + backend Firebase token verification
2. Email OTP login with secure hashed OTP storage and 5-minute expiry
3. Google login via Firebase popup + backend token verification
4. Returning user auto-fill (Continue as user) via localStorage
5. Session handling for custom JWT cookie (with optional NextAuth fallback)
6. Protected routes using Next.js 16 `proxy.ts`
7. Rate limiting for OTP requests
8. OTP resend timer in UI (30 seconds)
9. Unified user profile API

## Folder Structure

```text
src/
  app/
    api/
      auth/
        [...nextauth]/route.ts
        google/route.ts
        logout/route.ts
        me/route.ts
        phone-login/route.ts
        send-otp/route.ts
        verify-otp/route.ts
      user/
        me/route.ts
  components/
    providers/
      SessionAuthProvider.tsx
    views/
      LoginView.tsx
  lib/
    auth.ts
    db.ts
    firebase-admin.ts
    firebase-client.ts
    jwt.ts
    mailer.ts
    nextAuth.ts
    otp.ts
    rateLimit.ts
    session.ts
  models/
    AuthRateLimit.ts
    OtpCode.ts
    User.ts
  types/
    next-auth.d.ts
  proxy.ts
.env.example
```

## Environment Variables

Copy and configure:

```bash
cp .env.example .env
```

Required groups:

- MongoDB: `MONGODB_URI`, `MONGODB_DB`
- OTP JWT: `JWT_SECRET`, `OTP_HASH_SECRET`
- NextAuth (optional): `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Firebase client: `NEXT_PUBLIC_FIREBASE_*`
- Firebase admin: `FIREBASE_SERVICE_ACCOUNT_KEY` (or split vars)
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure `.env`

3. Start dev server

```bash
npm run dev
```

4. Open `http://localhost:3000`

## API Routes

- `POST /api/auth/send-otp`
  - body: `{ email }`
  - sends email OTP, stores hashed OTP, rate-limited

- `POST /api/auth/verify-otp`
  - body: `{ email, otp, name? }`
  - verifies OTP, creates/logins user, sets JWT cookie (`rentro_token`)

- `POST /api/auth/phone-login`
  - body: `{ phone, firebaseToken, name? }`
  - verifies Firebase ID token, creates/logins user, sets JWT cookie

- `GET /api/auth/google`
  - redirects to NextAuth Google sign-in flow (optional flow)

- `GET/POST /api/auth/[...nextauth]`
  - NextAuth core routes (`signin`, `callback`, `session`, etc.)

- `GET /api/user/me`
  - unified authenticated user (supports NextAuth session and OTP JWT)

- `POST /api/auth/logout`
  - clears OTP cookie and NextAuth cookies

## Frontend Login UX

`LoginView` now supports:

- Continue with phone
- Continue as returning user
- Continue with Google
- Login with email
- OTP verification screens
- Loading/error states
- Resend OTP timer (30s)

Returning user data is saved in localStorage key: `rentro_last_login`.

## Security Notes

- OTP expiry is fixed to 5 minutes
- OTP is HMAC-hashed before storage (`OTP_HASH_SECRET`)
- OTP verification uses timing-safe hash comparison
- OTP request endpoint includes Mongo-backed rate limiting
- Cookies are HttpOnly, Secure in production

## Route Protection

Protected routes are handled in `src/proxy.ts`:

- `/home/*`
- `/chat/*`
- `/pricing-availability/*`

A user is considered authenticated if either:

- valid NextAuth session token exists
- custom OTP auth cookie (`rentro_token`) exists

## Production Checklist

1. Set strong secrets for `JWT_SECRET`, `OTP_HASH_SECRET`, `NEXTAUTH_SECRET`
2. Enable Firebase Phone auth and authorized domains
3. Configure Google OAuth consent + callback URLs
4. Use SMTP credentials from trusted provider (SES, SendGrid, Mailgun, etc.)
5. Run behind HTTPS so secure cookies are enforced
6. Monitor OTP abuse and tune rate limits for your traffic

## Deploy (Node.js Server)

This project uses a custom server (`server.mjs`) for Socket.IO, so deploy it as a long-running Node process (for example: Railway, Render, VM, Docker).

1. Install dependencies:

```bash
npm ci
```

2. Build production bundle:

```bash
npm run build
```

3. Start production server:

```bash
npm run start
```

4. Add all required environment variables from `.env.example` in your deployment platform.

5. Ensure your auth domains are configured:

- Firebase Authentication authorized domains: add your production domain.
- Google Cloud OAuth authorized redirect URI (if using NextAuth flow):
  - `https://your-domain.com/api/auth/callback/google`
