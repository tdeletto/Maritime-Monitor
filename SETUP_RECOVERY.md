# Maritime Monitor - Setup Recovery Guide

## ✅ Issues Fixed

Your repository had several issues that have been corrected:

1. **Export/Import Mismatch** - `main.ts` was importing `initializeApp` but `App.ts` wasn't exporting it
   - **Fixed**: Added named export `initializeApp` function to `App.ts`

2. **Missing Vite Plugin** - `vite.config.ts` was importing `vite-plugin-pwa` which wasn't in `package.json`
   - **Fixed**: Removed PWA plugin from vite config (optional feature)

3. **Nested Directory Problem** - Your local clone got into a nested directory loop (`maritime-monitor/maritime-monitor/maritime-monitor/...`)
   - **Solution**: Complete clean setup below

4. **Missing Configuration** - `tsconfig.node.json` exists in repo but wasn't being found due to nested paths

## 🧹 Clean Setup Instructions (Your Next Steps)

### Step 1: Complete Cleanup
```bash
# Navigate to your home directory
cd ~

# Remove the corrupted directory structure completely
rm -rf maritime-monitor

# Verify it's gone
ls -la | grep maritime
```

### Step 2: Fresh Clone
```bash
# Clone the repository fresh
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor

# Verify you're in the right place (should show src/, package.json, index.html)
ls -la
```

### Step 3: Install Dependencies
```bash
# Clean install of node modules
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install
```

### Step 4: Configure Environment Variables
```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit with your API keys (see below)
nano .env.local
# or
code .env.local
```

### Step 5: Start Development Server
```bash
# Start the Vite dev server
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.0.154:5173/
```

## 🔑 Required Environment Variables

Your `.env.local` file needs these keys (from `.env.local.example`):

```env
# AIS Hub API (for vessel tracking)
VITE_AIS_HUB_API_KEY=your_ais_hub_key_here

# OpenWeather API (for weather data)
VITE_OPENWEATHER_API_KEY=your_openweather_key_here

# Optionally, include other service keys as documented
```

**Where to get them:**
- [AIS Hub](https://www.aishub.net/) - Vessel tracking data
- [OpenWeatherMap](https://openweathermap.org/api) - Weather data

## 🐛 If You Still Get Errors

### Error: "No matching version found for leaflet-fullscreen"
This is a known issue with an outdated dependency. It won't prevent the app from running. The app will work without full-screen capabilities.

### Error: "Cannot find package 'vite-plugin-pwa'"
This has been fixed in the latest version. Pull the latest changes:
```bash
git pull origin main
```

### Error: "Failed to scan for dependencies"
Make sure you're in the correct directory:
```bash
pwd
# Should show: /Users/thomasdeletto/maritime-monitor

# NOT: /Users/thomasdeletto/maritime-monitor/maritime-monitor
```

### Error about missing files
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json .vite
npm install
npm run dev
```

## ✨ Verify It Works

Once the dev server starts, you should see:
```
  VITE v5.0.7 ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.0.154:5173/
  ➜  press h + enter to show help
```

Then open http://localhost:5173/ in your browser.

## 🚀 What's Next

- **Add your API keys** in `.env.local`
- **Start the dev server** with `npm run dev`
- **Deploy** to GitHub Pages with `git push origin main`

See `BUILD_AND_RUN.md` for detailed documentation.
