# Maritime Monitor - Configuration Flowchart

## Decision Tree: How to Set Up API Keys

```
╯────────────────────────────────────────────────────────╻
│ Do you want to automate the setup?                      │
└────────────────────────────────────────────────────────┛
                                │
                    ╯──────────╫
                    │  YES  │  NO  │
                    └──╯──└──╯
                       │      │
                    ╯─╫─╯  ╯─╫─╯
         macOS/  │        │  │ Manual │
         Linux  bash     Windows │ Setup  │
                scripts/ scripts/ │ (.env) │
                setup-  setup-   │        │
                env.sh  env.bat  │        │
                       │        │        │
                       └────────────╫
                                │
                       ╯───────╫
                       │.env.local│
                       │ configured│
                       └───────┛
                                │
                       npm run dev
                                │
              http://localhost:5173
```

---

## AIS Hub API Setup Flow

```
Start
  │
  │ https://www.aishub.net/
  │
  ↗ ↘ ↙
   Create Account
  ↗ ↘ ↙
   │
   Verify Email
  ↗ ↘ ↙
   │
   Dashboard → API
  ↗ ↘ ↙
   │
   Copy API Key
  ↗ ↘ ↙
   │
   .env.local: VITE_AIS_HUB_API_KEY
  ↗ ↘ ↙
   │
   ✓ Complete
```

---

## OpenWeather API Setup Flow

```
Start
  │
  │ https://openweathermap.org/
  │
  ↗ ↘ ↙
   Create Account
  ↗ ↘ ↙
   │
   Verify Email
  ↗ ↘ ↙
   │
   Account → My API keys
  ↗ ↘ ↙
   │
   Copy Default Key
  ↗ ↘ ↙
   │
   .env.local: VITE_OPENWEATHER_API_KEY
  ↗ ↘ ↙
   │
   ✓ Complete
```

---

## Maritime Awareness Service Decision Tree

```
                    Choose Security Data Provider
                              │
                              │
        ╯────────────────────────────╫
        │      Fast?  Easy?  Cost?  Global?  │
        └────────────────────────────┛
                              │
        ╯────────────────────────────────╫
        │
        │ ReCAAP ISC (Default)
        │ ✓ Yes   ✓ Yes   ✓ FREE  ✗ SE Asia Only
        │ Setup: 0 minutes
        │ URL: https://www.recaap.org/rss
        │ KEY: recaap_rss_feed
        │ → Ready immediately
        │
        │ IMO GISIS
        │ ✗ No    ✗ No    ✓ FREE  ✓ Yes
        │ Setup: 1-2 weeks (institutional)
        │ Requires: Government/institutional affiliation
        │ → Global coverage
        │
        │ Marine Traffic
        │ ✓ Yes   ✓ Yes   ✗ $99/mo ✓ Yes
        │ Setup: 5 minutes
        │ URL: https://marinetraffic.com/api
        │ → Premium global service
        │
        │ Custom Integration
        │ ✗ No    ✗ No    Varies  ✓ Flexible
        │ Setup: 10+ minutes
        │ Options: News feeds, scraping, multiple sources
        │ → Full control, maximum flexibility
        │
        └────────────────────────────────┛
```

---

## Complete Setup Timeline

```
Timeline                   Task                          Duration
──────────────────────────────────────

0:00  [===========================================] 
      ✓ Read API_KEYS_QUICK_START.md                1-2 min

0:02  [=========================================================]
      ✓ Choose setup method (auto/manual)           30 sec

0:03  [============================================================]
      ✓ Set up AIS Hub (signup + copy key)          5 min

0:08  [================================================================]
      ✓ Set up OpenWeather (signup + copy key)      3 min

0:11  [====================================================================]
      ✓ Set up Maritime Awareness (ReCAAP/other)    1-2 min

0:13  [======================================================================]
      ✓ Run setup script or manual config            1-2 min

0:15  [========================================================================]
      ✓ Verify configuration (npm run dev)          1-2 min

0:17  [==========================================================================] COMPLETE

Total: ~15-20 minutes for full setup
```

---

## Configuration File Organization

```
maritim-monitor/
├── .env.local                 ← YOUR LOCAL CONFIGURATION (DO NOT COMMIT)
│   │
└── .env.local.example          ← TEMPLATE WITH FULL DOCUMENTATION
    |
    │ Copy and edit:
    │   cp .env.local.example .env.local
    │
    └── Contains:
        └─ VITE_AIS_HUB_API_KEY
        └─ VITE_OPENWEATHER_API_KEY  
        └─ VITE_MARITIME_AWARENESS_API_KEY
        └─ Plus 20+ optional settings


Supporting Documentation:
├── API_KEYS_QUICK_START.md     ← 2-minute reference
├── .env.setup.md               ← 30-minute detailed guide
├── API_CONFIGURATION_SUMMARY.md ← Complete summary
├── CONFIGURATION_FLOWCHART.md  ← This file
└── scripts/
    ├── setup-env.sh               ← macOS/Linux wizard
    └── setup-env.bat              ← Windows wizard
```

---

## API Key Priority Matrix

```
                           Must Have    Nice to Have    Optional
                           ──────    ────────    ───────

AIS Hub                    ✓            ✓ (vessel data)
(Vessel Tracking)          

OpenWeather                ✓            ✓ (weather alerts)
(Maritime Weather)         

Maritime Awareness              ✓       ✓ (security layer)
(Security Data)            (ReCAAP RSS)   (Premium options)

Suggested Startup:
  ✓ Start with AIS Hub + OpenWeather + ReCAAP RSS (all free)
  → You have working maritime monitor with core features
  ↓
  ✓ Then add premium options as needed:
    - Marine Traffic for global security data
    - IMO GISIS for institutional coverage
    - Custom integrations for specialized data
```

---

## Security Configuration Progression

```
Phase 1: Development
├─ Use free tier API keys
├─ Store in .env.local (local machine only)
├─ Enable debug logging
└─ No authentication needed

Phase 2: Testing/Staging
├─ Use test/staging API keys
├─ Implement API call logging
├─ Monitor rate limits
└─ Document setup process

Phase 3: Production
├─ Use production API keys
├─ Implement backend API proxy
├─ Keys stored in CI/CD secrets
├─ Keys NOT in client-side code
├─ Implement rate limit handling
├─ Set up monitoring and alerts
└─ Regular key rotation (every 3 months)
```

---

## Troubleshooting Decision Tree

```
                 Something not working?
                         │
                         │
            ╯────────────╫
            │ Check issue type   │
            └────────────┛
                     │
        ╯──────────────────╫
        │  │   │    │
     Can't  .env.local   API      No data
     start  not found    errors   appearing
     app    (401/429)
        │     │        │        │
        │     │        │        │
        │     │        │        │
        │  ✓ Copy    ✓ Verify  ✓ Check
        │    template   key is    layer is
        │    cp .env    correct   enabled
        │    local.    Restart   in UI
        │    example   server
        │    .env
        │
        ✓ Check
          VITE_*
          keys in
          .env.local
          (no typos)
```

---

## Documentation Navigation

```
Quick Setup (5-10 min)          Detailed Learning (30 min)     Reference
──────────────────────────────────────────────────────
──────

Start Here:
  └─╫ API_KEYS_QUICK_START.md     .env.setup.md                .env.local.example

Then Choose:
  ╯─ Use Wizard               Read 5-minute guide          Check config reference
  │  └─╫ bash scripts/         Understand each API          Documentation
  │     setup-env.sh or        section (15-30 min)          └─ 400+ lines
  │     setup-env.bat                                         └─ All settings
  │                                                           └─ Examples
  │
  └─ Manual Setup
     1. cp .env.local.example .env.local
     2. Edit with your keys
     3. npm run dev

Verify:
  └─ npm run dev
  └─ Check browser console
  └─ See maritime layers
```

---

## Command Reference

### Setup Commands

**Automated Setup** (Recommended):
```bash
# macOS/Linux
bash scripts/setup-env.sh

# Windows
scripts\setup-env.bat
```

**Manual Setup**:
```bash
# Copy template
cp .env.local.example .env.local

# Edit with your editor
nano .env.local
# or
code .env.local
# or
subl .env.local
```

### Verification Commands

```bash
# Start dev server
npm run dev

# Check .env.local exists
ls -la .env.local

# View configuration
grep VITE_ .env.local

# Check for typos
grep VITE_AIS_HUB_API_KEY .env.local
grep VITE_OPENWEATHER_API_KEY .env.local
grep VITE_MARITIME_AWARENESS_API_KEY .env.local
```

### Debug Commands

```bash
# View all environment variables
env | grep VITE_

# Test specific API key
curl -H "X-API-KEY: YOUR_KEY_HERE" https://www.aishub.net/api/...

# Monitor API calls in browser
# Press F12 > Network tab > Filter by Fetch/XHR
```

---

## Common Questions

**Q: Do I need all three API keys?**  
A: No. Start with just AIS Hub. Weather and Security are optional layers.

**Q: Is ReCAAP RSS enough for security data?**  
A: Yes! ReCAAP provides excellent SE Asia coverage for free. Upgrade if you need global coverage.

**Q: Why is my setup script not working?**  
A: Make sure you're in the project root directory: `cd maritime-monitor`

**Q: Can I use fake keys for testing?**  
A: Yes, but you won't get real data. Use free tier keys for realistic testing.

**Q: How often do I need to update my keys?**  
A: Rotate every 3 months for security. More often if compromised.

**Q: Will my keys be exposed if I push to GitHub?**  
A: No. `.env.local` is in `.gitignore`. But always verify before committing.

---

**Last Updated**: February 14, 2026
