/**
 * Stripe PaymentIntent - Create and return client_secret for charging when accepting a bid.
 * Deploy to Vercel. Set STRIPE_SECRET_KEY in Vercel env vars.
 * Install stripe: npm install stripe
 *
 * POST body: { amount: number, currency?: string, requestId, biddingId, userId }
 *   - amount: in smallest currency unit (e.g. AED: 1 AED = 100 fils, so 50 AED = 5000)
 *   - currency: "aed" or "usd" (default "aed"). Use "usd" if AED not enabled on your Stripe account.
 * Returns: { clientSecret: string }
 */

let Stripe;
try {
  Stripe = require('stripe');
} catch (e) {
  console.error('Stripe package not installed. Run: npm install stripe');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!Stripe) {
    return res.status(500).json({ error: 'Stripe package not installed. Run: npm install stripe' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    const stripeKeys = Object.keys(process.env).filter((k) => k.toUpperCase().includes('STRIPE'));
    return res.status(500).json({
      error: 'STRIPE_SECRET_KEY not set in Vercel environment variables',
      hint: stripeKeys.length
        ? `Found: ${stripeKeys.join(', ')} — value may be empty; re-add and redeploy`
        : 'No STRIPE vars in this deployment — add to the Vercel project that serves this URL and redeploy',
    });
  }

  try {
    const { amount, currency = 'aed', requestId, biddingId, userId } = req.body || {};

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'amount required and must be positive' });
    }

    // amount must be integer (smallest unit: fils for AED)
    const amountInt = Math.round(Number(amount));
    if (amountInt <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const stripe = new Stripe(secretKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInt,
      currency: (currency || 'aed').toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        requestId: requestId || '',
        biddingId: biddingId || '',
        userId: userId || '',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('PaymentIntent error:', err);
    const message = err.message || 'Failed to create payment intent';
    // Pass through Stripe errors (e.g. "Your account cannot make charges in that currency")
    res.status(500).json({ error: message });
  }
};
