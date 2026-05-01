'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be set in Vercel env vars
// Test key format: pk_test_...
// Live key format: pk_live_...
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      color: '#0f172a',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#ef4444' },
  },
}

function CheckoutForm({ amount, onSuccess, onError, customerInfo }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [cardError, setCardError] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)

  // Fetch payment intent when amount changes
  // amount is in DOLLARS; API route converts to cents internally
  useEffect(() => {
    if (!amount || amount <= 0) return
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        metadata: {
          email: customerInfo?.email || '',
          name: customerInfo?.name || '',
        },
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { onError?.(data.error); return }
        setClientSecret(data.clientSecret)
      })
      .catch(err => onError?.(err.message))
  }, [amount])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return
    setLoading(true)
    setCardError(null)

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: customerInfo?.name || 'Customer',
          email: customerInfo?.email || '',
        },
      },
    })

    if (error) {
      setCardError(error.message)
      setLoading(false)
      // GA4: exception
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: false
        });
      }
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess?.(paymentIntent)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        border: '1.5px solid #e2e8f0',
        borderRadius: 12,
        padding: '14px 16px',
        background: '#f8fafc',
        marginBottom: 12,
      }}>
        <CardElement options={CARD_STYLE} />
      </div>

      {cardError && (
        <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{cardError}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        style={{
          width: '100%',
          padding: '14px 0',
          borderRadius: 100,
          border: 'none',
          background: loading ? '#94a3b8' : '#0f172a',
          color: '#fff',
          fontWeight: 900,
          fontSize: 13,
          letterSpacing: '0.12em',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {loading ? 'Processing...' : `PAY $${(amount || 0).toFixed(2)}`}
      </button>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
        Secured by Stripe &bull; 256-bit SSL encryption
      </p>
    </form>
  )
}

// Exported wrapper — receives same props, renders Stripe Elements + form
export default function StripeCheckout({ amount, onSuccess, onError, customerInfo }) {
  if (!stripePromise) {
    return (
      <div style={{ padding: 16, background: '#fef9c3', borderRadius: 8, fontSize: 13, color: '#854d0e', textAlign: 'center' }}>
        Stripe not configured. Contact support or use PayPal below.
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        customerInfo={customerInfo}
      />
    </Elements>
  )
}
