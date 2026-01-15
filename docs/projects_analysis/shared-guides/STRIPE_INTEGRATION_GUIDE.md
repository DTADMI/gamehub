# Comprehensive Stripe Integration Guide

## B2C & B2B Payment Processing for SaaS Products

**Last Updated**: January 15, 2026
**Version**: 2.0
**Target Audience**: Individual consumers (B2C) and businesses (B2B)

---

## Table of Contents

- [Overview](#overview)
- [B2C Implementation](#b2c-implementation)
- [B2B Implementation](#b2b-implementation)
- [Subscription Management](#subscription-management)
- [Payment Methods](#payment-methods)
- [Invoicing & Billing](#invoicing--billing)
- [Tax Handling](#tax-handling)
- [Security & Compliance](#security--compliance)
- [Testing & Going Live](#testing--going-live)

---

## Overview

### Why Stripe?

- **Comprehensive**: Handles subscriptions, invoices, tax, fraud prevention
- **Global**: Supports 135+ currencies, 45+ countries
- **Developer-Friendly**: Excellent API, webhooks, libraries
- **Compliant**: PCI DSS Level 1, SCA-ready, GDPR-compliant
- **Pricing**: 2.9% + $0.30 per transaction (US), competitive internationally

### Key Stripe Concepts

**For B2C (Individual Users)**:

- **Customer**: Individual person with email/name
- **Subscription**: Recurring payment (monthly/annual)
- **Payment Method**: Credit card, debit card, Apple Pay, Google Pay
- **Invoice**: Automatic for subscriptions, downloadable by user

**For B2B (Businesses)**:

- **Customer**: Company with business details (name, VAT, address)
- **Subscription**: Often annual with custom pricing
- **Payment Method**: ACH, wire transfer, invoices (net-30 terms)
- **Invoice**: Sent to accounts payable, includes purchase orders

---

## B2C Implementation

### Phase 1: Setup (Week 1)

#### 1.1 Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

#### 1.2 Environment Variables

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 1.3 Create Products & Prices (Stripe Dashboard or API)

```typescript
// scripts/setup-stripe-products.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function setupProducts() {
  // Free tier (no product needed, just feature flags)

  // Starter tier
  const starterProduct = await stripe.products.create({
    name: 'Starter Plan',
    description: 'Perfect for individuals getting started',
  });

  const starterMonthly = await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 999, // $9.99
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Starter Monthly',
  });

  const starterAnnual = await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 9999, // $99.99 (17% discount)
    currency: 'usd',
    recurring: { interval: 'year' },
    nickname: 'Starter Annual',
  });

  // Pro tier
  const proProduct = await stripe.products.create({
    name: 'Pro Plan',
    description: 'For power users and small teams',
  });

  const proMonthly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 1999, // $19.99
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Pro Monthly',
  });

  const proAnnual = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 19999, // $199.99 (17% discount)
    currency: 'usd',
    recurring: { interval: 'year' },
    nickname: 'Pro Annual',
  });

  console.log('Products created:', {
    starterMonthly: starterMonthly.id,
    starterAnnual: starterAnnual.id,
    proMonthly: proMonthly.id,
    proAnnual: proAnnual.id,
  });
}

setupProducts();
```

---

### Phase 2: Checkout Flow (Week 1-2)

#### 2.1 Pricing Page Component

```tsx
// components/PricingTable.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyPriceId: string;
  annualPriceId: string;
  features: string[];
  popular?: boolean;
}

export function PricingTable() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const tiers: PricingTier[] = [
    {
      name: 'Free',
      description: 'Perfect for trying out',
      monthlyPrice: 0,
      annualPrice: 0,
      monthlyPriceId: '',
      annualPriceId: '',
      features: [
        'Basic features',
        'Up to 100 items',
        'Community support',
        '1GB storage',
      ],
    },
    {
      name: 'Starter',
      description: 'For individuals',
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      monthlyPriceId: 'price_starter_monthly',
      annualPriceId: 'price_starter_annual',
      features: [
        'All Free features',
        'Unlimited items',
        'Priority support',
        '20GB storage',
        'Advanced analytics',
      ],
      popular: true,
    },
    {
      name: 'Pro',
      description: 'For power users',
      monthlyPrice: 19.99,
      annualPrice: 199.99,
      monthlyPriceId: 'price_pro_monthly',
      annualPriceId: 'price_pro_annual',
      features: [
        'All Starter features',
        'Team collaboration (5 users)',
        'API access',
        '100GB storage',
        'Custom integrations',
      ],
    },
  ];

  const handleSubscribe = async (priceId: string, tierName: string) => {
    setLoading(tierName);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();

      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe redirect error:', error);
      }
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pricing-table">
      {/* Billing Toggle */}
      <div className="billing-toggle">
        <button
          className={billingInterval === 'monthly' ? 'active' : ''}
          onClick={() => setBillingInterval('monthly')}
        >
          Monthly
        </button>
        <button
          className={billingInterval === 'annual' ? 'active' : ''}
          onClick={() => setBillingInterval('annual')}
        >
          Annual
          <span className="badge">Save 17%</span>
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`pricing-card ${tier.popular ? 'popular' : ''}`}
          >
            {tier.popular && <div className="badge">Most Popular</div>}

            <h3>{tier.name}</h3>
            <p className="description">{tier.description}</p>

            <div className="price">
              <span className="amount">
                ${billingInterval === 'monthly' ? tier.monthlyPrice : tier.annualPrice}
              </span>
              <span className="interval">/{billingInterval === 'monthly' ? 'mo' : 'yr'}</span>
            </div>

            <ul className="features">
              {tier.features.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>

            {tier.monthlyPriceId ? (
              <button
                onClick={() =>
                  handleSubscribe(
                    billingInterval === 'monthly'
                      ? tier.monthlyPriceId
                      : tier.annualPriceId,
                    tier.name
                  )
                }
                disabled={loading === tier.name}
                className="subscribe-button"
              >
                {loading === tier.name ? 'Loading...' : 'Get Started'}
              </button>
            ) : (
              <button className="subscribe-button free">Current Plan</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 2.2 Create Checkout Session API

```typescript
// app/api/stripe/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth'; // Your auth library (NextAuth, Clerk, etc.)
import { db } from '@/lib/db'; // Your database client

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();

    // Check if customer already has a Stripe customer ID
    let customerId = session.user.stripeCustomerId;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
        },
      });

      customerId = customer.id;

      // Save to database
      await db.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

---

### Phase 3: Webhook Handler (Week 2)

#### 3.1 Webhook Endpoint

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const subscriptionId = session.subscription as string;

  if (!userId) return;

  // Fetch full subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await db.subscription.create({
    data: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Send welcome email
  // await sendSubscriptionWelcomeEmail(userId);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  await db.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      stripePriceId: subscription.items.data[0].price.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
    },
  });

  // Send cancellation email
  // await sendSubscriptionCanceledEmail(subscription);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
    include: { user: true },
  });

  if (!subscription) return;

  // Send payment failed email
  // await sendPaymentFailedEmail(subscription.user.email, invoice);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Send payment receipt
  // await sendPaymentReceiptEmail(invoice);
}
```

#### 3.2 Database Schema (Prisma)

```prisma
// prisma/schema.prisma
model User {
  id                String         @id @default(cuid())
  email             String         @unique
  name              String?
  stripeCustomerId  String?        @unique
  subscriptions     Subscription[]
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}

model Subscription {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  stripeSubscriptionId  String   @unique
  stripeCustomerId      String
  stripePriceId         String
  status                String   // active, canceled, past_due, trialing, incomplete
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  cancelAtPeriodEnd     Boolean  @default(false)
  canceledAt            DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([stripeCustomerId])
}
```

---

## B2B Implementation

### Enterprise Subscription Setup

#### 1. Create B2B Products

```typescript
// scripts/setup-b2b-products.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function setupB2BProducts() {
  // Business tier
  const businessProduct = await stripe.products.create({
    name: 'Business Plan',
    description: 'For small to medium businesses (up to 50 users)',
  });

  const businessAnnual = await stripe.prices.create({
    product: businessProduct.id,
    unit_amount: 49900, // $499/year
    currency: 'usd',
    recurring: { interval: 'year' },
    nickname: 'Business Annual',
  });

  // Enterprise tier (custom pricing, quote-based)
  const enterpriseProduct = await stripe.products.create({
    name: 'Enterprise Plan',
    description: 'Custom solutions for large organizations',
  });

  console.log('B2B Products created:', {
    businessAnnual: businessAnnual.id,
    enterprise: enterpriseProduct.id,
  });
}

setupB2BProducts();
```

#### 2. B2B Checkout with Invoice Terms

```typescript
// app/api/stripe/create-b2b-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req);
    if (!session?.user || !session?.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, companyName, companyVAT, billingEmail } = await req.json();

    // Create business customer
    const customer = await stripe.customers.create({
      email: billingEmail,
      name: companyName,
      metadata: {
        companyName,
        vatNumber: companyVAT,
        userId: session.user.id,
      },
    });

    // Create subscription with invoice payment
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      collection_method: 'send_invoice', // Send invoice instead of immediate charge
      days_until_due: 30, // Net-30 terms
      metadata: {
        companyName,
        userId: session.user.id,
      },
    });

    // Save to database
    await db.subscription.create({
      data: {
        userId: session.user.id,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customer.id,
        stripePriceId: priceId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        tier: 'business',
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('B2B subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
```

#### 3. Team Member Management

```typescript
// app/api/team/add-member/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role } = await req.json();

    // Check subscription seats
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
      include: {
        teamMembers: true,
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    const maxSeats = subscription.tier === 'business' ? 50 : 5;
    if (subscription.teamMembers.length >= maxSeats) {
      return NextResponse.json({ error: 'Seat limit reached' }, { status: 400 });
    }

    // Invite team member
    const teamMember = await db.teamMember.create({
      data: {
        subscriptionId: subscription.id,
        email,
        role,
        invitedAt: new Date(),
      },
    });

    // Send invitation email
    // await sendTeamInviteEmail(email, teamMember.id);

    return NextResponse.json({ teamMember });
  } catch (error) {
    console.error('Team member error:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}
```

---

## Subscription Management

### Customer Portal Integration

```typescript
// app/api/stripe/create-portal-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
```

### Usage in UI

```tsx
// components/ManageSubscriptionButton.tsx
'use client';

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleManageSubscription} disabled={loading}>
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  );
}
```

---

## Payment Methods

### Support Multiple Payment Methods

```typescript
// Create checkout session with multiple payment methods
const checkoutSession = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: 'subscription',
  payment_method_types: ['card', 'us_bank_account', 'sepa_debit'], // Multiple options
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
});
```

---

## Tax Handling

### Stripe Tax (Automatic Tax Calculation)

```typescript
// Enable Stripe Tax in checkout session
const checkoutSession = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  automatic_tax: { enabled: true }, // Automatic tax calculation
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
});
```

---

## Security & Compliance

### PCI Compliance

- **Stripe Elements**: Never handle raw card data
- **Stripe.js**: All card data goes directly to Stripe
- **Webhooks**: Verify signatures to prevent tampering

### Best Practices

1. **Never log card data** (it's illegal)
2. **Verify webhook signatures** (prevent replay attacks)
3. **Use HTTPS** (mandatory for production)
4. **Implement idempotency keys** (prevent duplicate charges)
5. **Handle errors gracefully** (card declined, insufficient funds)

---

## Testing & Going Live

### Test Mode

```bash
# Test cards (Stripe provides these)
4242 4242 4242 4242  # Visa (success)
4000 0000 0000 0002  # Visa (declined)
4000 0025 0000 3155  # Visa (requires 3D Secure)
```

### Test Webhooks Locally

```bash
# Install Stripe CLI
npm install -g stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Go Live Checklist

- [ ] Replace test keys with live keys
- [ ] Enable Stripe Tax (if applicable)
- [ ] Set up production webhook endpoint
- [ ] Test all payment flows end-to-end
- [ ] Enable fraud prevention (Stripe Radar)
- [ ] Set up billing alerts
- [ ] Configure email receipts
- [ ] Add terms of service & privacy policy links

---

## Summary

This guide covers:

- ✅ **B2C**: Individual subscriptions with credit cards
- ✅ **B2B**: Business subscriptions with invoices and team management
- ✅ **Webhooks**: Real-time subscription updates
- ✅ **Customer Portal**: Self-service subscription management
- ✅ **Tax**: Automatic tax calculation
- ✅ **Security**: PCI compliance and best practices
- ✅ **Testing**: Test mode and webhook testing

**Next Steps**: Adapt this guide to your specific project by:

1. Customizing pricing tiers
2. Adding project-specific features (e.g., usage-based billing)
3. Integrating with your authentication system
4. Setting up email notifications
5. Adding analytics tracking (PostHog, Mixpanel)

**Reference Projects**:

- LibraKeeper: B2B API licensing
- QuestHunt: Freemium with creator monetization
- StoryForge: AI assistant add-ons
- All projects: Standard subscription tiers
