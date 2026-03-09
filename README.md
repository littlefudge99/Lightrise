# LightRise - Oura Smart Alarm Prototype

An intelligent alarm clock that uses your Oura Ring sleep data to wake you during light sleep, minimizing morning grogginess.

## 🌟 Features

- **OAuth 2.0 Integration** with Oura Ring API
- **Real-time Sleep Stage Analysis** (deep, light, REM, awake)
- **Optimal Wake Time Detection** within your custom alarm window
- **Sleep Data Visualization** with scores and stage breakdowns

## 🚀 Live Demo

Visit: [https://YOUR-USERNAME.github.io/lightrise/](https://YOUR-USERNAME.github.io/lightrise/)

## 📋 Prerequisites

- Oura Ring (Gen 3 or later)
- Active Oura membership
- Oura OAuth Application (see setup below)

## 🔧 Setup Instructions

### 1. Create Oura OAuth Application

1. Go to [cloud.ouraring.com/oauth/applications](https://cloud.ouraring.com/oauth/applications)
2. Click "Create New Application"
3. Fill in the details:
   - **Name:** LightRise
   - **Redirect URI:** `https://YOUR-USERNAME.github.io/lightrise/`
   - **Scopes:** Select `daily`, `personal`, and `email`
4. Save and copy your **Client ID** and **Client Secret**

### 2. Use the App

1. Open the app at your GitHub Pages URL
2. Enter your Client ID and Client Secret
3. Click "🔐 Authorize with Oura"
4. Approve the permissions on Oura's website
5. Complete the connection and view your sleep data!

## ⚠️ Important Notes

### Viability Assessment

This is a **proof-of-concept prototype** to test the feasibility of using Oura Ring data for smart alarms. Key findings:

**✓ What Works:**
- Sleep stage data is accurate and detailed
- 5-minute interval granularity
- Reliable API access

**✗ Limitations:**
- **5-15 minute data sync delay** (not real-time)
- Requires Bluetooth sync between ring and phone
- May miss brief light sleep windows
- iOS background fetch restrictions

### Recommendation

The 5-15 minute latency means you need a **30-60 minute alarm window** to reliably catch light sleep phases. This works better as a "gentle wake-up" tool rather than precise real-time optimization.

For a production app, consider:
- Combining with phone accelerometer data for movement detection
- Using larger wake-up windows
- Implementing predictive algorithms based on sleep history

## 🔒 Security Note

**⚠️ IMPORTANT:** This prototype handles OAuth tokens in the browser for testing purposes only. In a production app:
- Never expose your Client Secret in client-side code
- Implement OAuth token exchange on a backend server
- Use secure token storage

## 📱 Future Development

To turn this into a real iOS app:
- Native Swift/SwiftUI development required
- Implement local notifications for alarms
- Add background app refresh capabilities
- Store OAuth tokens securely in iOS Keychain
- Combine with device sensors for better real-time detection

## 📄 License

MIT License - Feel free to use and modify for your own projects.

## 🤝 Contributing

This is a personal prototype, but suggestions and improvements are welcome!

---

**Disclaimer:** This app is not affiliated with or endorsed by Oura Health Ltd.
