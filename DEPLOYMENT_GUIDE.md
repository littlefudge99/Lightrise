# GitHub Pages Deployment Guide for LightRise

Follow these steps to deploy your Oura Smart Alarm prototype to GitHub Pages.

## Step 1: Create a GitHub Account (if you don't have one)

1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Follow the registration process

## Step 2: Create a New Repository

1. Click the **"+"** icon in the top right corner
2. Select **"New repository"**
3. Fill in the details:
   - **Repository name:** `lightrise`
   - **Description:** "Smart alarm using Oura Ring sleep data"
   - **Public** (select this option)
   - ✓ Check "Add a README file"
4. Click **"Create repository"**

## Step 3: Upload Your Files

### Option A: Using the Web Interface (Easiest)

1. In your new repository, click **"Add file"** → **"Upload files"**
2. Drag and drop these files:
   - `index.html` (the main app file)
   - `README.md` (optional, but recommended)
3. Scroll down and click **"Commit changes"**

### Option B: Using Git (If you're comfortable with command line)

```bash
# Clone your repository
git clone https://github.com/YOUR-USERNAME/lightrise.git
cd lightrise

# Add your files (copy index.html and README.md to this folder)

# Commit and push
git add .
git commit -m "Initial commit - LightRise prototype"
git push origin main
```

## Step 4: Enable GitHub Pages

1. In your repository, click **"Settings"** (top menu)
2. Scroll down to **"Pages"** in the left sidebar
3. Under "Source", select:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Click **"Save"**
5. Wait 1-2 minutes for deployment

## Step 5: Get Your URL

After deployment completes, GitHub will show:

```
Your site is live at https://YOUR-USERNAME.github.io/lightrise/
```

**This is your app's permanent URL!**

## Step 6: Configure Oura OAuth Application

Now that you have your URL, go back to Oura:

1. Go to [cloud.ouraring.com/oauth/applications](https://cloud.ouraring.com/oauth/applications)
2. Click "Create New Application" (or edit existing)
3. Set the **Redirect URI** to:
   ```
   https://YOUR-USERNAME.github.io/lightrise/
   ```
   ⚠️ **Important:** Must match exactly (including trailing slash)
4. Save and copy your Client ID and Client Secret

## Step 7: Test Your App

1. Open `https://YOUR-USERNAME.github.io/lightrise/`
2. Enter your Client ID and Client Secret
3. Click "🔐 Authorize with Oura"
4. You should be redirected to Oura, then back to your app
5. Complete the connection and view your sleep data!

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the URI in your Oura app **exactly matches** your GitHub Pages URL
- Include or exclude the trailing `/` consistently
- Check for `http` vs `https` (GitHub Pages uses `https`)

### App doesn't load
- Wait a few minutes after enabling GitHub Pages
- Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Check that `index.html` is in the root of your repository

### OAuth errors
- Verify your Client ID and Client Secret are correct
- Make sure you created the OAuth app (not a personal access token)
- Check that all required scopes are selected (daily, personal, email)

## Making Updates

To update your app later:

1. Go to your repository on GitHub
2. Click on `index.html`
3. Click the pencil icon (Edit)
4. Make your changes
5. Click "Commit changes"
6. Changes will be live in 1-2 minutes

## Custom Domain (Optional)

If you want a custom domain like `lightrise.app`:

1. Buy a domain from Namecheap, Google Domains, etc.
2. In GitHub Settings → Pages, add your custom domain
3. Update DNS records at your domain registrar
4. Update the Redirect URI in your Oura OAuth app

---

**You're all set!** 🎉

Your Oura Smart Alarm prototype is now live at:
`https://YOUR-USERNAME.github.io/lightrise/`
