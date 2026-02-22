/**
 * Stripe PaymentIntent - Create and return client_secret for charging rider when accepting a bid.
 * Deploy with stream-token-backend to Vercel. Set STRIPE_SECRET_KEY in Vercel env vars.
 *
 * POST body: { amount: number, currency?: string, requestId, biddingId, userId }
 *   - amount: in smallest currency unit (e.g. AED: 100 AED = 10000 fils)
 *   - currency: default "aed"
 * Returns: { clientSecret: string }
 */
const Stripe = require('stripe');

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

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('Missing STRIPE_SECRET_KEY');
    return res.status(500).json({ error: 'Server misconfigured' });
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
    res.status(500).json({
      error: err.message || 'Failed to create payment intent',
    });
  }
};
