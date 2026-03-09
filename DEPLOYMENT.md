# LightRise Deployment Guide

## Quick Deployment Checklist

### Step 1: Update Oura OAuth Settings ✓
- [x] Go to https://cloud.ouraring.com/oauth/applications
- [x] You already have an app created
- [ ] Update Redirect URI to: `https://YOUR-USERNAME.github.io/lightrise/`
- [ ] Save changes

### Step 2: Upload to GitHub ✓
- [ ] Create new repository: `lightrise`
- [ ] Make it **Public**
- [ ] Upload these 4 files:
  - `index.html`
  - `app.js`
  - `styles.css`
  - `README.md`

### Step 3: Enable GitHub Pages ✓
- [ ] Go to repository **Settings**
- [ ] Click **Pages** in sidebar
- [ ] Source: `main` branch, `/root` folder
- [ ] Click **Save**
- [ ] Wait 1-2 minutes for deployment

### Step 4: Update Redirect URI with Final URL ✓
- [ ] Copy your live URL: `https://YOUR-USERNAME.github.io/lightrise/`
- [ ] Go back to Oura OAuth app
- [ ] Paste this EXACT URL in Redirect URI field
- [ ] **Important:** Include the trailing slash `/`
- [ ] Save

### Step 5: Test It! ✓
- [ ] Open your app URL
- [ ] Click "Connect with Oura"
- [ ] Log in with Oura
- [ ] Approve permissions
- [ ] See your sleep data!

---

## Detailed Instructions

### For GitHub First-Timers

1. **Create GitHub Account**
   - Go to https://github.com
   - Sign up for free
   - Verify your email

2. **Create New Repository**
   - Click the `+` icon in top right
   - Select "New repository"
   - Repository name: `lightrise`
   - Description: "Smart sleep alarm using Oura Ring"
   - Make it **Public** (required for GitHub Pages)
   - Don't initialize with README (we have our own)
   - Click "Create repository"

3. **Upload Files**
   - Click "uploading an existing file"
   - Drag all 4 files into the upload area
   - Scroll down
   - Click "Commit changes"

4. **Enable GitHub Pages**
   - Click "Settings" tab at top
   - Scroll down to "Pages" in left sidebar
   - Under "Source":
     - Branch: `main`
     - Folder: `/ (root)`
   - Click "Save"
   - You'll see: "Your site is published at https://..."

5. **Final OAuth Setup**
   - Copy the URL from step 4
   - Go to https://cloud.ouraring.com/oauth/applications
   - Click your app name
   - In "Redirect URIs" field, paste: `https://YOUR-USERNAME.github.io/lightrise/`
   - **CRITICAL:** Make sure the URL matches EXACTLY
     - Include `https://`
     - Include your username
     - Include `/lightrise/` at the end
     - Include the trailing `/`
   - Click "Save Application"

6. **Test**
   - Open your GitHub Pages URL
   - Click "Connect with Oura"
   - Log in
   - Approve permissions
   - You should see your sleep data!

---

## Your OAuth Credentials

Already configured in the app:
```
Client ID: cd4fe21f-54d0-4d80-bfd0-b35bad347e97
Client Secret: upYyQDFWMbgrQ5zKZxpV3s2QGIvl5ZlWyyZ0ks61EHts
```

**Important:** Your redirect URI must be set to your exact GitHub Pages URL.

---

## Common Issues & Solutions

### "OAuth Error: redirect_uri_mismatch"
**Problem:** The redirect URI in Oura doesn't match your actual URL.

**Solution:**
1. Check your actual URL (from GitHub Pages)
2. Make sure it matches EXACTLY in Oura settings
3. Common mistakes:
   - Missing `https://`
   - Wrong username
   - Missing `/lightrise/` at end
   - Missing trailing `/`
   - Extra spaces

**Correct format:**
```
https://yourusername.github.io/lightrise/
```

### "Page not found (404)"
**Problem:** GitHub Pages not enabled or files in wrong location.

**Solution:**
1. Make sure repository is **Public**
2. Check Settings → Pages is enabled
3. Files should be in root directory (not in a subfolder)
4. Wait 1-2 minutes after enabling Pages

### "Failed to fetch" or "CORS error"
**Problem:** Browser blocking the OAuth token exchange.

**Solution:**
This is expected for web apps. The OAuth flow should still work - you'll be redirected to Oura, approve, and come back with an access token.

If it completely fails:
1. Try clearing browser cache
2. Try in incognito/private window
3. Check browser console for specific errors

### "No sleep data found"
**Problem:** No recent sleep sessions in Oura.

**Solution:**
1. Make sure you wore your ring last night
2. Make sure your ring synced with the Oura app
3. Try clicking the refresh button
4. Check the Oura app to confirm data is there

---

## Testing Locally (Optional)

If you want to test before deploying:

1. **Start a local server:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or Python 2
   python -m SimpleHTTPServer 8000
   ```

2. **Update Oura redirect URI to:**
   ```
   http://localhost:8000/
   ```

3. **Open in browser:**
   ```
   http://localhost:8000/
   ```

4. **When ready to deploy:**
   - Upload to GitHub
   - Change redirect URI back to GitHub Pages URL

---

## Next Steps After Deployment

1. **Test thoroughly**
   - Try logging in
   - Check sleep data loads
   - Set an alarm window
   - Analyze optimal wake time

2. **Share feedback**
   - Does the data look accurate?
   - Is the UI intuitive?
   - Any bugs or issues?

3. **Consider next steps**
   - Want to build a native app?
   - Need backend server for production?
   - Want to add more features?

---

## Security Note

⚠️ **For Production Use:**

The Client Secret is currently in the JavaScript file. This is OK for a personal prototype, but for a production app:

- Client Secret should be on a backend server
- OAuth token exchange should happen server-side
- Consider using PKCE flow for better security

For this prototype/testing, it's fine as-is!

---

## Need Help?

- Check the main README.md for feature documentation
- Review troubleshooting section above
- Check browser console for errors (F12)
- Verify Oura OAuth settings match exactly

Happy testing! 🎉
