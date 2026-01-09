# System Architecture

## Tech Stack

### Frontend

- Next.js (App Router)
- Tailwind CSS
- Mobile-first responsive layout

### Authentication

- Supabase Email OTP authentication

### Database

- Supabase PostgreSQL
- Row Level Security (RLS) enabled

### Video Streaming

- Cloudflare Stream (signed URLs)

### Hosting

- Vercel (Frontend + Edge Functions)

### Security

- Tokenized QR codes
- Device-based session tracking
- Expiring access tokens

## User Flow

1. User scans a QR code
2. System validates QR token
3. User enters email
4. OTP is sent to email
5. User verifies OTP
6. Device session is created
7. User is redirected to video content
8. Session expires automatically after 24 hours

## Admin Flow

1. Admin logs into admin panel
2. Admin generates one-time QR codes
3. QR codes are stored in database with unused status
4. Admin can:
   - View used / unused QRs
   - View active sessions
   - Revoke user sessions if required

## QR Flow

1. QR code contains a signed, random token
2. Token is stored in database with:
   - is_used = false
   - expiry timestamp
3. On scan:
   - Token is validated
   - Token is marked as used
   - Token is permanently linked to user_id
4. Token cannot be reused or reassigned
