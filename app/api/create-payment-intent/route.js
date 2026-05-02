import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { composeDecorators, rateLimit } from '../../../lib/decorators/index';
import { wrapContractRoute } from '../../../lib/contract-validator';
import { API_CACHE_HEADERS } from '../../../lib/api-helpers';

export const POST = wrapContractRoute(
  composeDecorators(rateLimit(30, 60000))(async (request) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Stripe not configured. Add STRIPE_SECRET_KEY to Vercel env vars.' }, {status: 500, headers: API_CACHE_HEADERS });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    try {
      const { amount, currency = 'usd', metadata = {}, payment_method, off_session, confirm: doConfirm } = await request.json();

      if (!amount || amount < 50) {
        return NextResponse.json({ error: 'Invalid amount (min $0.50)' }, {status: 400, headers: API_CACHE_HEADERS });
      }

      const piParams = {
        amount: Math.round(amount * 100), // convert dollars to cents
        currency,
        automatic_payment_methods: { enabled: true },
        metadata,
      };

      // One-click upsell: reuse saved payment method
      if (payment_method) {
        piParams.payment_method = payment_method;
        piParams.off_session = true;
        if (doConfirm) {
          piParams.confirm = true;
        }
      }

      const paymentIntent = await stripe.paymentIntents.create(piParams);

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      }, { headers: API_CACHE_HEADERS });
    } catch (err) {
      return NextResponse.json({ error: 'Internal server error' }, {status: 500, headers: API_CACHE_HEADERS });
    }
  }),
  'create-payment-intent:POST'
);

