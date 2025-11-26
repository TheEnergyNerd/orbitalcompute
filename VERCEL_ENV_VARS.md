# Vercel Environment Variables

## Required Environment Variables

Add these in your Vercel project settings (Settings → Environment Variables):

### 1. `NEXT_PUBLIC_CESIUM_ION_TOKEN`
- **Required**: Yes
- **Description**: Cesium Ion access token for 3D globe rendering
- **How to get**: 
  1. Go to https://cesium.com/ion/signup/ (or login if you have an account)
  2. After signing up/login, go to https://cesium.com/ion/tokens/
  3. Create a new token or use your default token
  4. Copy the token value
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. `NEXT_PUBLIC_API_BASE`
- **Required**: Yes
- **Description**: Your Railway backend API URL
- **How to get**: 
  1. Go to your Railway project dashboard
  2. Click on your deployed service
  3. Copy the URL (e.g., `https://your-app.railway.app`)
  4. Use this exact URL (no trailing slash)
- **Example**: `https://your-app.railway.app`
- **Note**: Make sure to update this after Railway deployment completes

## Optional Environment Variables

None required - the app will work with just the two above.

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `NEXT_PUBLIC_CESIUM_ION_TOKEN`
   - **Value**: Your Cesium token
   - **Environment**: Production, Preview, Development (select all)
4. Repeat for `NEXT_PUBLIC_API_BASE`
5. Click **Save**
6. Redeploy your project (Vercel will auto-redeploy after adding env vars)

## Quick Checklist

- [ ] Get Cesium Ion token from https://cesium.com/ion/tokens/
- [ ] Get Railway backend URL from Railway dashboard
- [ ] Add `NEXT_PUBLIC_CESIUM_ION_TOKEN` to Vercel
- [ ] Add `NEXT_PUBLIC_API_BASE` to Vercel (with your Railway URL)
- [ ] Redeploy Vercel project

## Troubleshooting

**Globe not loading?**
- Check that `NEXT_PUBLIC_CESIUM_ION_TOKEN` is set correctly
- Verify token is valid at https://cesium.com/ion/tokens/

**API calls failing?**
- Check that `NEXT_PUBLIC_API_BASE` matches your Railway URL exactly
- Verify Railway backend is running (visit Railway URL in browser)
- Check Railway logs for errors

**Build failing?**
- Make sure both environment variables are set
- Check Vercel build logs for specific errors

