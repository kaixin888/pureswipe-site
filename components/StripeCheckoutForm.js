'use client'

import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

export default function StripeCheckoutForm({ total, items, onPaymentSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    // 1. Create PaymentIntent on server
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total, items }),
    })

    const { clientSecret, error: backendError } = await response.json()

    if (backendError) {
      setError(backendError)
      setProcessing(false)
      return
    }

    // 2. Confirm payment on client
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: 'Clowand Customer', // In real app, get from input
        },
      },
    })

    if (result.error) {
      setError(result.error.message)
      setProcessing(false)
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess(result.paymentIntent)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#0f172a',
                '::placeholder': { color: '#94a3b8' },
              },
              invalid: { color: '#ef4444' },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <button
        disabled={!stripe || processing}
        className="w-full py-4 bg-slate-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)} with Card`}
      </button>

      <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-black italic">
        🔒 SECURE ENCRYPTED TRANSACTION
      </p>
    </form>
  )
}
