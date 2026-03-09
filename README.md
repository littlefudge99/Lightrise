# LightRise - Vercel Deployment Guide

## Why Vercel?
- ✅ **Serverless functions** handle OAuth token exchange
- ✅ **No CORS issues** - everything runs server-side
- ✅ **Free tier** is generous
- ✅ **Auto-deploy** from GitHub
- ✅ **Custom domains** supported
- ✅ **Environment variables** for secrets

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub

1. Create a new repository on GitHub: `lightrise`
2. Upload all files from this folder:
   - `api/` folder (contains auth/token.js)
   - `public/` folder (contains HTML, CSS, JS)
   - `vercel.json`
   - `package.json`
   - `README.md`

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your `lightrise` repository
5. **Important:** Add environment variables:
   - `OURA_CLIENT_ID`: `cd4fe21f-54d0-4d80-bfd0-b35bad347e97`
   - `OURA_CLIENT_SECRET`: `upYyQDFWMbgrQ5zKZxpV3s2QGIvl5ZlWyyZ0ks61EHts`
6. Click "Deploy"
7. Wait ~1 minute

### Step 3: Get Your URL

Vercel will give you a URL like:
```
https://lightrise.vercel.app
```

Or:
```
https://lightrise-yourusername.vercel.app
```

### Step 4: Update Oura Redirect URI

1. Go to https://cloud.ouraring.com/oauth/applications
2. Edit your OAuth application
3. Set Redirect URI to: `https://lightrise.vercel.app/`
   (or whatever URL Vercel gave you)
4. **CRITICAL:** Include the trailing slash `/`
5. Click "Save Application"

### Step 5: Test!

1. Open your Vercel URL
2. Click "Connect with Oura"
3. Log in with your Oura credentials
4. Approve permissions
5. You should see your sleep data! 🎉

## That's It!

No backend server to manage, no CORS issues, everything just works!

---

## Detailed Setup Instructions

### Setting Environment Variables in Vercel

1. In your Vercel dashboard, click your project
2. Go to "Settings" → "Environment Variables"
3. Add these variables:
   - **Name:** `OURA_CLIENT_ID`  
     **Value:** `cd4fe21f-54d0-4d80-bfd0-b35bad347e97`
   - **Name:** `OURA_CLIENT_SECRET`  
     **Value:** `upYyQDFWMbgrQ5zKZxpV3s2QGIvl5ZlWyyZ0ks61EHts`
4. Click "Save"

### Verify Deployment

After deployment, test these URLs:

1. **Main app:** `https://your-app.vercel.app/`
2. **API endpoint:** `https://your-app.vercel.app/api/auth/token`  
   Should return: `{"error":"Method not allowed"}` (this is correct!)

### Using a Custom Domain

1. In Vercel dashboard → "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Oura redirect URI to your custom domain

---

## Troubleshooting

### "Failed to connect to Oura"

**Check:**
1. Environment variables are set in Vercel
2. Redirect URI in Oura matches your Vercel URL exactly
3. Trailing slash `/` is included in redirect URI

**Fix:**
- Redeploy after adding environment variables
- Check browser console for actual error message

### "redirect_uri_mismatch"

**Problem:** Oura redirect URI doesn't match

**Fix:**
1. Get exact URL from Vercel dashboard
2. Copy it to Oura OAuth app settings
3. Make sure trailing `/` is included

### API function not working

**Check:**
- `api/auth/token.js` is in the correct folder
- `vercel.json` is in root directory
- Environment variables are set

---

## Project Structure

```
lightrise/
├── api/
│   └── auth/
│       └── token.js          # Serverless function for OAuth
├── public/
│   ├── index.html            # Main app
│   ├── app.js                # Frontend logic
│   └── styles.css            # Styling
├── vercel.json               # Vercel configuration
├── package.json              # Dependencies
└── README.md                 # Documentation
```

---

## How It Works

1. **User clicks "Connect with Oura"**
   - Frontend redirects to Oura's authorization page

2. **User approves permissions**
   - Oura redirects back with authorization code

3. **Frontend calls `/api/auth/token`**
   - Vercel serverless function exchanges code for access token
   - Client secret stays secure on server

4. **Token returned to frontend**
   - Frontend stores token in localStorage
   - Makes API calls directly to Oura with token

5. **Sleep data displayed**
   - App fetches and visualizes sleep stages

---

## Advantages Over GitHub Pages

| Feature | GitHub Pages | Vercel |
|---------|-------------|--------|
| Static hosting | ✅ | ✅ |
| Serverless functions | ❌ | ✅ |
| Environment variables | ❌ | ✅ |
| OAuth token exchange | ❌ CORS issues | ✅ Works perfectly |
| Auto-deploy | ✅ | ✅ |
| Custom domains | ✅ | ✅ |
| Free tier | ✅ | ✅ Better limits |

---

## Next Steps

After successful deployment:

1. **Test thoroughly** - Try different alarm windows
2. **Share with friends** - Get feedback
3. **Monitor usage** - Check Vercel analytics
4. **Add features** - Sleep trends, notifications, etc.

---

## Going to Production

For a real production app:

1. **Add Supabase** (if you want)
   - User accounts and profiles
   - Store sleep history
   - User preferences

2. **Add monitoring**
   - Sentry for error tracking
   - Analytics for user behavior

3. **Native mobile app**
   - React Native or Swift/Kotlin
   - Real alarm notifications
   - Background sync

---

## Need Help?

- Vercel Discord: https://vercel.com/discord
- Vercel Docs: https://vercel.com/docs
- This is way easier than the GitHub Pages approach! 🎉

---

## Cost

**Free tier includes:**
- 100 GB bandwidth/month
- Unlimited serverless function executions
- Unlimited API requests
- Free SSL certificate
- Analytics

This should be more than enough for personal use!
