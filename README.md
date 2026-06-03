# FB Auto Revenue Suite

A production-ready SaaS platform for automating Facebook marketing, lead generation, and revenue tracking.

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v4 (Facebook OAuth + Email/Password)
- **Payments**: Stripe (subscriptions + webhooks)
- **AI**: OpenAI GPT-4o-mini
- **Email**: Resend
- **UI**: Tailwind CSS + Radix UI + Recharts

---

## Local Development

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd fb-auto-revenue-suite
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in every value in `.env.local` (see **Environment Variables** section below).

### 3. Database Setup

```bash
# Start a local PostgreSQL instance (or use Railway/Supabase)
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Test credentials (after seeding):**
| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@fbrevenue.com     | Admin123!  |
| Demo  | demo@fbrevenue.com      | Demo123!   |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Full app URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random 32-char secret (`openssl rand -base64 32`) |
| `FACEBOOK_APP_ID` | Meta App ID from developers.facebook.com |
| `FACEBOOK_APP_SECRET` | Meta App Secret |
| `FACEBOOK_VERIFY_TOKEN` | Any string you choose for webhook verification |
| `STRIPE_PUBLIC_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan ($49/mo) |
| `STRIPE_AGENCY_PRICE_ID` | Stripe price ID for Agency plan ($149/mo) |
| `OPENAI_API_KEY` | OpenAI API key |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender email (e.g. `noreply@yourdomain.com`) |
| `NEXT_PUBLIC_APP_URL` | Public app URL |
| `NEXT_PUBLIC_APP_NAME` | App display name |

---

## Deployment

### Option A — Vercel + Railway (Recommended)

#### Database on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **PostgreSQL**
2. Copy the `DATABASE_URL` from the Railway dashboard
3. Run migrations remotely:
   ```bash
   DATABASE_URL="<railway-url>" npx prisma migrate deploy
   DATABASE_URL="<railway-url>" npx prisma db seed
   ```

#### App on Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add all environment variables in **Settings → Environment Variables**
4. Deploy — Vercel auto-detects Next.js

#### Stripe Webhooks

1. In the Stripe dashboard go to **Developers → Webhooks → Add endpoint**
2. URL: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
4. Copy the **Signing secret** → set as `STRIPE_WEBHOOK_SECRET`

#### Facebook Webhooks

1. In Meta for Developers → your app → **Webhooks → Page**
2. Callback URL: `https://your-app.vercel.app/api/webhooks/facebook`
3. Verify token: same value as `FACEBOOK_VERIFY_TOKEN` in your env
4. Subscribe to: `messages`, `messaging_postbacks`, `feed`

---

### Option B — Docker + VPS

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t fb-revenue-suite .
docker run -p 3000:3000 --env-file .env.production fb-revenue-suite
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

### Facebook Pages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/facebook/pages` | List connected pages |
| POST | `/api/facebook/pages` | Connect pages via access token |
| PATCH | `/api/facebook/pages/:id` | Toggle page active status |
| DELETE | `/api/facebook/pages/:id` | Disconnect page |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts?page=1&status=PUBLISHED` | List posts |
| POST | `/api/posts` | Create/publish/schedule post |
| GET | `/api/posts/:id` | Get single post |
| PATCH | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads?search=&status=` | List leads with filters |
| POST | `/api/leads` | Create lead |
| PATCH | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate` | Generate post with AI (costs 1 credit) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics?range=30` | Full analytics (7/30/90 days) |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stripe/create-checkout` | Start Stripe checkout |
| POST | `/api/stripe/portal` | Open billing portal |
| GET | `/api/billing/invoices` | List invoices |
| POST | `/api/webhooks/stripe` | Stripe webhook handler |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile + subscription |
| PATCH | `/api/user/profile` | Update name/avatar |
| PATCH | `/api/user/password` | Change password |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| PATCH | `/api/notifications` | Mark as read |

### Admin (ADMIN role only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/stats` | Platform stats |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhooks/facebook` | Facebook webhook verification |
| POST | `/api/webhooks/facebook` | Handle Messenger messages |

---

## Subscription Plans

| Feature | Free | Pro ($49/mo) | Agency ($149/mo) |
|---------|------|-------------|-----------------|
| Facebook Pages | 1 | 5 | Unlimited |
| Posts/month | 10 | Unlimited | Unlimited |
| AI Credits | 5 | 100 | 500 |
| Lead CRM | Basic | Full | Full |
| Auto-Reply | No | Yes | Yes |
| Analytics | Basic | Advanced | Advanced |
| White-label | No | No | Yes |
| Team Members | No | No | Yes |

---

## Testing

### Manual Test Flow

1. **Register** at `/register` — confirm you land on `/dashboard`
2. **Connect a Facebook Page** at `/dashboard/pages` using a real or test access token
3. **Create a post** at `/dashboard/posts` — test Draft, Publish, and Schedule
4. **Generate AI content** at `/dashboard/ai` — verify credit deduction
5. **Add a lead** at `/dashboard/leads` — test status updates
6. **View Analytics** at `/dashboard/analytics`
7. **Upgrade plan** at `/dashboard/billing` — complete Stripe test checkout

### Stripe Test Cards

| Scenario | Card Number |
|----------|------------|
| Success | `4242 4242 4242 4242` |
| Requires auth | `4000 0025 0000 3155` |
| Decline | `4000 0000 0000 9995` |

Use any future expiry and any 3-digit CVC.

### Seed Data Reset

```bash
npx prisma migrate reset
npx prisma db seed
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, forgot/reset password
│   ├── (dashboard)/     # Protected dashboard routes
│   ├── (admin)/         # Admin-only routes
│   └── api/             # All API route handlers
├── components/
│   ├── ui/              # Base UI components (Button, Input, Card...)
│   ├── layout/          # Sidebar, Header
│   ├── dashboard/       # Dashboard widgets
│   ├── posts/           # Posts management
│   ├── leads/           # CRM / leads
│   ├── analytics/       # Charts & analytics
│   ├── pages/           # Facebook pages manager
│   ├── ai/              # AI content generator
│   ├── billing/         # Billing / plans
│   ├── settings/        # Account settings
│   └── admin/           # Admin dashboard
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── db.ts            # Prisma singleton
│   ├── stripe.ts        # Stripe client + plan config
│   ├── openai.ts        # OpenAI helpers
│   ├── facebook.ts      # Meta Graph API helpers
│   ├── email.ts         # Resend email helpers
│   └── utils.ts         # Shared utilities
└── types/
    └── next-auth.d.ts   # Session type augmentation
prisma/
├── schema.prisma        # Full database schema
└── seed.ts              # Sample data seed
```
