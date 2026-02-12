/**
 * Stream Chat/Video Token - Vercel Serverless Function
 * Deploy this folder to Vercel. Set STREAM_API_KEY and STREAM_API_SECRET in Vercel env vars.
 * Endpoint: https://your-app.vercel.app/api/stream-token?userId=xxx
 */
const {StreamChat} = require('stream-chat');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({error: 'userId required'});
  }

  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error('Missing STREAM_API_KEY or STREAM_API_SECRET');
    return res.status(500).json({error: 'Server misconfigured'});
  }

  try {
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    const token = serverClient.createToken(userId);
    res.json({token});
  } catch (err) {
    console.error('Token error:', err);
    res.status(500).json({error: 'Failed to create token'});
  }
};
