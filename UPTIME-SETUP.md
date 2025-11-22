# Keep-Alive Setup for Render Backend

Your backend is deployed at: **https://maruzzella-roster-clock-in.onrender.com**

Render free tier spins down after 15 minutes of inactivity, causing 30-60 second cold starts on the next request.

## Solution: Free Uptime Monitoring

Use **cron-job.org** (100% free, no credit card required) to ping your backend every 5 minutes:

### Setup Instructions:

1. **Go to cron-job.org**
   - Visit: https://cron-job.org/
   - Click "Sign up" (free account)

2. **Create a Cron Job**
   - After login, click "Create cronjob"
   - **Title:** `Maruzzella Backend Keep-Alive`
   - **URL:** `https://maruzzella-roster-clock-in.onrender.com/health`
   - **Schedule:** Every 5 minutes
     - Select: `*/5 * * * *` (every 5 minutes)
   - **Notifications:** Off (optional)
   - Click "Create cronjob"

3. **Test It**
   - Click "Run now" to test the ping
   - Should return: `{"status":"ok","timestamp":"...","uptime":...}`

### Alternative Free Services:

If you prefer other services:

- **UptimeRobot** (https://uptimerobot.com/)
  - Free: 50 monitors, 5-minute intervals
  - Monitor Type: HTTP(s)
  - URL: `https://maruzzella-roster-clock-in.onrender.com/health`
  - Monitoring Interval: 5 minutes

- **Freshping** (https://www.freshworks.com/website-monitoring/)
  - Free: 50 checks, 1-minute intervals
  - Great for more frequent pings

## What This Does:

✅ Keeps your backend "warm" and responsive
✅ Prevents cold starts for your users
✅ Reduces loading time from 1-2 minutes to <2 seconds
✅ No cost, completely free tier

## Health Check Endpoint:

Your backend now has two endpoints:
- `/` - Main status check
- `/health` - Detailed uptime monitoring (shows process uptime)

Both return JSON with status information.

## Expected Results:

**Before:** First request after 15+ minutes idle = 30-60 seconds
**After:** All requests = <2 seconds (backend stays awake)

---

**Note:** If you still experience delays, consider upgrading Render to the $7/month plan for guaranteed 24/7 uptime and faster performance.
