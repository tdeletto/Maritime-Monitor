# Maritime Monitor - Build & Run Guide

**Last Updated**: February 14, 2026  
**Status**: ✅ Ready for Production

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Building for Production](#building-for-production)
3. [Running Locally](#running-locally)
4. [Docker Deployment](#docker-deployment)
5. [Troubleshooting](#troubleshooting)
6. [Testing](#testing)

---

## Development Setup

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: Latest version
- **Docker** (optional): For containerized deployment

### Installation

```bash
# 1. Clone repository
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor

# 2. Install dependencies
npm install

# 3. Verify installation
npm --version
node --version
```

### Environment Configuration

```bash
# 1. Copy example environment file
cp .env.local.example .env.local

# 2. Add your API keys
cat > .env.local << EOF
# AIS Hub Vessel Tracking
VITE_AIS_HUB_API_KEY=your_ais_hub_key_here

# OpenWeather Data
VITE_OPENWEATHER_API_KEY=your_openweather_key_here

# Maritime Awareness (ReCAAP)
VITE_MARITIME_AWARENESS_API_KEY=recaap_rss_feed
EOF

# 3. Verify keys are set
grep VITE_ .env.local
```

### Getting API Keys

#### AIS Hub
```bash
# 1. Visit https://www.aishub.net/
# 2. Click "Register"
# 3. Create account
# 4. Go to "Account" > "API Key"
# 5. Copy your key

# Expected key format: alphanumeric, ~20 characters
```

#### OpenWeather
```bash
# 1. Visit https://openweathermap.org/
# 2. Click "Sign Up"
# 3. Create free account
# 4. Go to "API keys" section
# 5. Copy "Default" key

# Expected key format: 32-character hexadecimal
```

#### ReCAAP (No Setup Needed)
```bash
# ReCAAP data is public RSS feed
# Just use: VITE_MARITIME_AWARENESS_API_KEY=recaap_rss_feed
```

---

## Running Locally

### Development Server

```bash
# Start development server
npm run dev

# Output should show:
# VITE v5.0.7 ready in 234 ms
# → Local: http://localhost:5173/
# → press h to show help

# Open browser and navigate to http://localhost:5173
```

### Hot Module Replacement (HMR)

Changes to source code automatically reload in the browser:

```bash
# 1. Edit a file (e.g., src/App.ts)
# 2. Save changes
# 3. Browser automatically updates
# 4. State is preserved (in most cases)
```

### Development Tools

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format

# View all available commands
cat package.json | grep -A 20 '"scripts"'
```

---

## Building for Production

### Standard Build

```bash
# Build optimized production bundle
npm run build

# Output:
# ✓ 180 modules transformed.
# dist/index.html                   12.5 kB
# dist/assets/index-abc123.js       245.3 kB │ gzip: 78.2 kB
# dist/assets/index-def456.css      18.7 kB │ gzip: 5.1 kB

# Build artifacts are in ./dist/
```

### Verify Build

```bash
# Preview production build locally
npm run preview

# This starts a local server showing production build
# http://localhost:4173
```

### Build Size Analysis

```bash
# Check bundle size
ls -lh dist/

# Typical sizes:
# - index.html: ~12 KB
# - JavaScript: ~240 KB (gzipped: ~78 KB)
# - CSS: ~18 KB (gzipped: ~5 KB)
# - Total: ~270 KB (gzipped: ~83 KB)
```

### Environment Variables in Build

```bash
# These are baked into the build:
VITE_AIS_HUB_API_KEY=your_key
VITE_OPENWEATHER_API_KEY=your_key
VITE_MARITIME_AWARENESS_API_KEY=recaap_rss_feed

# Build command embeds them:
npm run build

# To use different keys:
VITE_AIS_HUB_API_KEY=other_key npm run build
```

---

## Docker Deployment

### Local Docker Development

```bash
# 1. Build Docker image
docker build -t maritime-monitor:latest .

# Output:
# Successfully built abc123def456
# Successfully tagged maritime-monitor:latest

# 2. Run container
docker run -p 3000:3000 \
  -e VITE_AIS_HUB_API_KEY=your_key \
  -e VITE_OPENWEATHER_API_KEY=your_key \
  maritime-monitor:latest

# 3. Access application
# http://localhost:3000

# 4. Stop container
# Press Ctrl+C
```

### Using Docker Compose

```bash
# 1. Create .env file with secrets
cat > .env << EOF
VITE_AIS_HUB_API_KEY=your_key
VITE_OPENWEATHER_API_KEY=your_key
VITE_MARITIME_AWARENESS_API_KEY=recaap_rss_feed
EOF

# 2. Start services
docker-compose up -d

# Output:
# [+] Running 1/1
#  ✓ Container maritime-monitor Started

# 3. View logs
docker-compose logs -f

# 4. Check health
docker ps

# 5. Stop services
docker-compose down
```

### Docker Build Optimization

```bash
# Build without cache (fresh build)
docker build --no-cache -t maritime-monitor:latest .

# Build with tags
docker build -t maritime-monitor:1.0.0 .
docker build -t maritime-monitor:latest .

# Check image size
docker images maritime-monitor
# REPOSITORY         TAG       SIZE
# maritime-monitor   latest    48MB
```

### Multi-Architecture Builds

```bash
# Build for multiple architectures
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t maritime-monitor:latest \
  .

# Requires buildx (install with Docker Desktop)
```

---

## Troubleshooting

### "Port already in use"

```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
vite --port 3001
```

### "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install
```

### "API keys not working"

```bash
# Verify .env.local exists
ls -la .env.local

# Verify keys are present
grep VITE_ .env.local

# Check they're loaded in browser
# Open DevTools Console
# Type: import.meta.env.VITE_AIS_HUB_API_KEY
```

### "Type errors during build"

```bash
# Run type checking
npm run type-check

# This shows TypeScript errors before building
# Fix errors reported

# Clear TypeScript cache if needed
find . -name 'tsconfig.tsbuildinfo' -delete
```

### "Build fails"

```bash
# Clean build
rm -rf dist
npm run build

# Check for errors in output
# Address any TypeScript or build errors

# Verify all dependencies installed
npm list
```

### Docker Container Won't Start

```bash
# Check logs
docker logs maritime-monitor

# Common issues:
# - Port already in use: change -p mapping
# - Missing environment variables: add -e flags
# - Wrong base image: rebuild with --no-cache

# Rebuild and retry
docker build --no-cache -t maritime-monitor:latest .
docker run -p 3000:3000 maritime-monitor:latest
```

---

## Testing

### Manual Testing Checklist

```bash
# 1. Start development server
npm run dev

# 2. Open application
# http://localhost:5173

# 3. Test features
- [ ] Map loads and displays
- [ ] Vessels appear on map
- [ ] Weather data displays
- [ ] Security incidents show
- [ ] Layer toggle works
- [ ] Map panning/zooming works
- [ ] Marker popups work
- [ ] Auto-refresh activates
- [ ] Dark mode toggle works
- [ ] Keyboard shortcuts work (Ctrl+R, Ctrl+L, Ctrl+T)

# 4. Check console for errors
# Open DevTools (F12)
# Check Console tab for any errors
```

### Browser Compatibility

```bash
# Tested on:
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

# Test in different browsers:
# 1. Build application
npm run build

# 2. Preview in different browsers
npm run preview
```

### API Testing

```bash
# Test AIS Hub API directly
curl -s 'https://www.aishub.net/api/v2/vessels?api_key=YOUR_KEY&xmin=40&xmax=100&ymin=-20&ymax=20&output=json' | jq .

# Test OpenWeather API
curl -s 'https://api.openweathermap.org/data/2.5/weather?lat=0&lon=0&appid=YOUR_KEY&units=metric' | jq .

# Test ReCAAP API
curl -s 'https://www.recaap.org/services/api/Incidents' | jq .
```

### Performance Testing

```bash
# Use Lighthouse (Chrome DevTools)
# 1. Open DevTools (F12)
# 2. Go to "Lighthouse" tab
# 3. Click "Generate report"
# 4. Review performance metrics

# Typical scores:
# Performance: 85-95
# Accessibility: 90-95
# Best Practices: 90-95
# SEO: 90-95
```

---

## Production Deployment

### Pre-Deployment Checklist

```bash
# 1. Test build
npm run build

# 2. Type check
npm run type-check

# 3. Run linter
npm run lint

# 4. Preview build
npm run preview

# 5. Commit changes
git add .
git commit -m "Prepare for production"

# 6. Push to main (if using GitHub Pages CI/CD)
git push origin main
```

### GitHub Pages Deployment

```bash
# Automatic deployment on push to main
# 1. Verify GitHub Actions is enabled
# 2. Add secrets (Settings > Secrets > Actions)
# 3. Push to main
# 4. Check Actions tab for deployment status
# 5. View at https://tdeletto.github.io/maritime-monitor
```

### Docker Hub Deployment

```bash
# 1. Tag image
docker tag maritime-monitor:latest your-username/maritime-monitor:latest
docker tag maritime-monitor:latest your-username/maritime-monitor:1.0.0

# 2. Login to Docker Hub
docker login

# 3. Push images
docker push your-username/maritime-monitor:latest
docker push your-username/maritime-monitor:1.0.0

# 4. Pull and run from Docker Hub
docker run -p 3000:3000 your-username/maritime-monitor:latest
```

---

## Performance Optimization

### Build Optimization

```bash
# The build is already optimized with:
- Tree shaking (removes unused code)
- Code splitting (separate chunks)
- Minification (smaller file sizes)
- Gzip compression
- Source maps (for debugging)
```

### Runtime Optimization

```javascript
// Services implement caching:
- 5-minute cache for vessel data
- 10-minute cache for weather data
- 30-minute cache for security incidents

// Rate limiting prevents API throttling:
- AIS Hub: 100 req/hour (automatic throttling)
- OpenWeather: 60 calls/min (queue management)
```

### Map Optimization

```javascript
// Leaflet optimizations:
- Vector tile layers (scalable)
- Marker clustering (performance)
- Layer groups (efficient rendering)
- Canvas rendering (GPU acceleration)
```

---

## Monitoring

### Application Logs

```bash
# Console logging is built-in
# Open DevTools Console (F12)

# Log format: [ServiceName] Message
# Examples:
# [Maritime Monitor] Application initialized
# [VesselTracker] Fetched 150 vessels
# [WeatherService] Returning cached weather
```

### Performance Monitoring

```bash
# Built-in performance tracking:
store.getStats()
# {
#   vesselCount: 245,
#   incidentCount: 8,
#   alertCount: 2,
#   lastUpdated: 2026-02-14T21:40:00.000Z
# }

# Cache statistics:
services.vesselTracker.getCacheStats()
# { size: 3, entries: [ 'vessels_-20_20_40_100', ... ] }
```

---

## Next Steps

1. **Read**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Full feature overview
2. **Deploy**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment
3. **Configure**: [API_KEYS_QUICK_START.md](./API_KEYS_QUICK_START.md) - API setup
4. **Start**: `npm run dev` - Begin development!

---

## Support

- **Issues**: https://github.com/tdeletto/maritime-monitor/issues
- **Documentation**: See README.md and other .md files
- **API Docs**:
  - AIS Hub: https://www.aishub.net/
  - OpenWeather: https://openweathermap.org/api
  - ReCAAP: https://www.recaap.org/

---

**Happy building!** 🚀
