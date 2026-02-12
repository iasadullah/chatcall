# Stream Token Backend (Vercel)

Generates JWT tokens for Stream Chat and Video SDKs. Deploy to Vercel.

## Deploy to Vercel

1. **Move this folder** out of your React Native project (e.g. to a separate repo or folder).

2. **Deploy**:
   - Go to [vercel.com](https://vercel.com)
   - Import the project (drag folder or connect Git)
   - Or: `vercel` from this folder

3. **Set environment variables** in Vercel Dashboard → Project → Settings → Environment Variables:
   - `STREAM_API_KEY` = your Stream API key (e.g. gsp5k82xt7q6)
   - `STREAM_API_SECRET` = your Stream API secret from [dashboard.getstream.io](https://dashboard.getstream.io)

4. **Use in your app** – add to `src/constants/Config.ts`:
   ```ts
   export const streamTokenUrl = 'https://YOUR_APP.vercel.app/api/stream-token';
   ```

## API

- **GET** `/api/stream-token?userId=xxx`
- **Response**: `{ "token": "eyJ..." }`
