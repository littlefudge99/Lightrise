# LightRise - Smart Sleep Alarm

Wake up during light sleep to feel refreshed and minimize morning grogginess using your Oura Ring data.

![LightRise](https://img.shields.io/badge/Status-Prototype-yellow) ![Oura API](https://img.shields.io/badge/Oura-API%20v2-blue)

## 🌟 Features

- **OAuth 2.0 Integration** - Secure login with your Oura account
- **Sleep Data Visualization** - See your sleep score, efficiency, and detailed sleep stages
- **Smart Alarm Analysis** - Find optimal wake times during light sleep
- **Sleep Stages Timeline** - Visual representation of your sleep cycles
- **Mobile-Friendly** - Responsive design works on any device

## 🚀 Quick Start

### 1. Update Oura OAuth App

1. Go to https://cloud.ouraring.com/oauth/applications
2. Edit your existing application
3. Update the **Redirect URI** to match your deployment URL:
   - For GitHub Pages: `https://YOUR-USERNAME.github.io/lightrise/`
   - For local testing: `http://localhost:8000/`
4. Save changes

### 2. Deploy to GitHub Pages

#### Option A: Upload Files via GitHub Website

1. Create a new repository called `lightrise`
2. Make it **Public**
3. Click "uploading an existing file"
4. Drag and drop all files:
   - `index.html`
   - `app.js`
   - `styles.css`
   - `README.md`
5. Commit changes
6. Go to **Settings** → **Pages**
7. Source: Deploy from branch `main`, folder `/root`
8. Click **Save**
9. Wait 1-2 minutes
10. Your app will be live at: `https://YOUR-USERNAME.github.io/lightrise/`

#### Option B: Use Git Command Line

```bash
# Create repository on GitHub first, then:
git clone https://github.com/YOUR-USERNAME/lightrise.git
cd lightrise

# Copy all files into this directory
# Then commit and push:
git add .
git commit -m "Initial commit - LightRise app"
git push origin main

# Enable GitHub Pages in Settings → Pages
```

### 3. Test the App

1. Open your app URL: `https://YOUR-USERNAME.github.io/lightrise/`
2. Click "Connect with Oura"
3. Log in with your Oura credentials
4. Approve the permissions
5. You'll be redirected back and see your sleep data!

## 📱 How to Use

### View Your Sleep Data
- See your latest sleep score, total sleep time, and efficiency
- View a detailed timeline of your sleep stages (deep, light, REM, awake)

### Set Smart Alarm Window
1. Choose your earliest wake time (e.g., 6:30 AM)
2. Choose your latest wake time (e.g., 7:30 AM)
3. Click "Set Smart Alarm"
4. The app analyzes when you were in light sleep
5. See if your last sleep session ended during optimal light sleep

### Understanding the Results
- **Light Sleep** = Best time to wake up feeling refreshed
- **Deep/REM Sleep** = Waking during these feels groggy
- **Awake** = Also a good time to wake up

## ⚠️ Important Notes

### This is a Prototype
This web app **cannot actually set alarms**. It can only:
- ✅ Show your sleep data
- ✅ Analyze optimal wake times
- ✅ Help you understand your sleep patterns
- ❌ Cannot trigger notifications or alarms

### Data Latency
Oura Ring data has a **5-15 minute sync delay**:
- The ring collects data locally
- It only syncs when connected to your phone via Bluetooth
- This means the data isn't truly "real-time"

### For a Real Alarm App
To build an actual smart alarm, you would need:
- **Native iOS/Android app** (not a web app)
- **Background app refresh** to poll Oura API during alarm window
- **Local notifications** to trigger the actual alarm
- **Bluetooth sync** to ensure ring is connected during sleep
- **30-60 minute alarm window** to account for data delay

## 🔒 Security & Privacy

- Your Oura credentials are never seen by this app
- OAuth tokens are stored securely in your browser
- All API calls go directly to Oura's servers
- No data is sent to third-party servers

**Note:** In production, the Client Secret should be kept on a backend server, not in client-side code. This prototype includes it for ease of testing.

## 🛠 Technical Details

### Built With
- **HTML5/CSS3/JavaScript** - Pure vanilla JS, no frameworks
- **Oura API v2** - OAuth 2.0 authentication
- **GitHub Pages** - Free hosting

### API Endpoints Used
- `GET /v2/usercollection/personal_info` - User information
- `GET /v2/usercollection/daily_sleep` - Sleep summaries
- `GET /v2/usercollection/sleep` - Detailed sleep stages (hypnogram)

### Sleep Stages
Oura provides sleep stage data in 5-minute intervals:
- **1** = Deep Sleep
- **2** = Light Sleep
- **3** = REM Sleep
- **4** = Awake

## 📊 How It Works

1. **OAuth Login** - Securely authenticate with Oura
2. **Fetch Sleep Data** - Get last 3 days of sleep sessions
3. **Parse Sleep Stages** - Extract 5-minute interval data
4. **Analyze Light Sleep** - Find light sleep periods near wake time
5. **Recommend Wake Time** - Suggest optimal wake windows

## 🐛 Troubleshooting

### "Failed to connect to Oura"
- Make sure your Redirect URI exactly matches your deployment URL
- Check that you're using the correct Client ID and Secret
- Try clearing browser cache and cookies

### "No sleep data found"
- Make sure you wore your Oura Ring last night
- Check that your ring synced with the Oura app
- Try clicking the refresh button

### "OAuth token exchange failed"
- This is a CORS issue - the browser blocks the token exchange
- Try using the Python server approach (see OAUTH_SETUP.md)
- Or use a personal access token instead (deprecated but still works)

## 🚧 Future Improvements

For a production-ready smart alarm app:
- [ ] Native mobile app (iOS/Android)
- [ ] Real alarm notifications
- [ ] Predictive algorithm based on sleep history
- [ ] Integration with phone's accelerometer
- [ ] Sleep quality trends and insights
- [ ] Custom alarm sounds
- [ ] Snooze with smart re-scheduling

## 📄 License

MIT License - Feel free to use and modify for your own projects.

## 🤝 Contributing

This is a personal prototype, but suggestions are welcome! Open an issue or submit a pull request.

## ⭐ Show Your Support

If you found this useful, give it a star on GitHub!

---

**Disclaimer:** This app is not affiliated with or endorsed by Oura Health Ltd. It's a third-party prototype for testing the feasibility of smart alarm features using Oura API data.

## 📞 Support

Questions or issues? Check the troubleshooting section above or open a GitHub issue.

Made with ❤️ for better mornings
