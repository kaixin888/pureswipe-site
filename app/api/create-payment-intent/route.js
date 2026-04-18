import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// STRIPE_SECRET_KEY must be set in Vercel environment variables
// Test key format: sk_test_...
// Live key format: sk_live_...
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe not configured. Add STRIPE_SECRET_KEY to Vercel env vars.' },
      { status: 500 }
    );
  }

  try {
    const { amount, currency = 'usd', metadata = {} } = await request.json();

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Invalid amount (min $0.50)' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert dollars to cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
