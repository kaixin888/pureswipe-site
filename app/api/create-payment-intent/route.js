import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// In a real app, use process.env.STRIPE_SECRET_KEY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
})

export async function POST(req) {
  try {
    const { amount, items } = await req.json()

    // 1. Check if we have a real secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      // Simulation mode for now — returns a placeholder client secret
      // This will fail on client side if no real test card is used,
      // but serves as a placeholder for UI development.
      return NextResponse.json({ 
        clientSecret: 'pi_placeholder_secret_placeholder',
        error: 'Stripe Secret Key missing. Contact admin to set up Stripe API.'
      }, { status: 400 })
    }

    // 2. Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: 'usd',
      metadata: {
        order_items: JSON.stringify(items.map(i => `${i.quantity}x ${i.name}`)),
      },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (err) {
    console.error('Stripe PaymentIntent error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
