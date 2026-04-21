import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Stripe not configured. Add STRIPE_SECRET_KEY to Vercel env vars.' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  });

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
