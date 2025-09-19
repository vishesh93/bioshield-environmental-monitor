# 🚂 Railway Deployment Guide for BioShield IoT Bridge

Railway is perfect for your IoT bridge - it offers automatic deployments, WebSocket support, and a generous free tier.

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Commit your cloud-bridge folder to Git:**
   ```bash
   # From your project root
   git add cloud-bridge/
   git commit -m "Add IoT bridge server for ESP32 integration"
   git push origin main
   ```

2. **Ensure your cloud-bridge folder has these files:**
   ```
   cloud-bridge/
   ├── server.js          ✅ Main server file
   ├── package.json       ✅ Dependencies
   ├── .env.example       ✅ Environment template
   └── .gitignore         ⚠️ Create this file
   ```

3. **Create `.gitignore` in cloud-bridge folder:**
   ```gitignore
   # Dependencies
   node_modules/
   
   # Environment variables
   .env
   
   # Logs
   *.log
   npm-debug.log*
   
   # Runtime data
   pids
   *.pid
   *.seed
   
   # Coverage directory used by tools like istanbul
   coverage/
   
   # Dependency directories
   node_modules/
   jspm_packages/
   
   # Optional npm cache directory
   .npm
   
   # Optional REPL history
   .node_repl_history
   ```

### Step 2: Create Railway Account

1. **Go to [railway.app](https://railway.app)**
2. **Click "Login" and sign up with GitHub**
3. **Authorize Railway to access your repositories**

### Step 3: Deploy Your Project

1. **Click "New Project"**
2. **Select "Deploy from GitHub repo"**
3. **Choose your `bioshield-environmental-monitor` repository**
4. **⚠️ IMPORTANT: Set Root Directory**
   - Click "Configure" before deploying
   - Set **Root Directory** to `cloud-bridge`
   - This tells Railway to deploy only the server folder

### Step 4: Configure Environment Variables

After deployment starts, add these environment variables:

1. **Go to your project dashboard**
2. **Click "Variables" tab**
3. **Add these variables:**

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
ESP32_API_KEY=bioshield-esp32-key-2024
ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app,http://localhost:3000,http://localhost:5173
```

**🔑 How to get your Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and open your project
2. Go to Settings → API
3. Copy the "Project URL" and "anon/public" key

### Step 5: Get Your Deployment URL

1. **Wait for deployment to complete** (usually 2-3 minutes)
2. **Your app will be available at:** `https://your-app-name.railway.app`
3. **Copy this URL - you'll need it for ESP32 and frontend**

### Step 6: Test Your Deployment

1. **Health Check:**
   ```bash
   curl https://your-app-name.railway.app/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T12:00:00.000Z",
     "service": "BioShield IoT Bridge",
     "version": "1.0.0"
   }
   ```

2. **Test ESP32 Endpoint:**
   ```bash
   curl -X POST https://your-app-name.railway.app/api/esp32/data \
     -H "Content-Type: application/json" \
     -H "X-API-Key: bioshield-esp32-key-2024" \
     -d '{
       "station_id": 1,
       "ph": 7.2,
       "tds": 450,
       "temperature": 25.5
     }'
   ```

3. **Test Web API:**
   ```bash
   curl https://your-app-name.railway.app/api/sensors/latest
   ```

## 🔧 Configure Your ESP32

Update your ESP32 code with the Railway URL:

```cpp
// Replace these lines in your ESP32 code:
const char* SERVER_URL = "https://your-app-name.railway.app/api/esp32/data";
const char* API_KEY = "bioshield-esp32-key-2024";

// Your existing sensor code stays the same!
void sendSensorData() {
  // Your pH, TDS, temperature reading code...
  
  // Create JSON and send to Railway server
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);
  
  // Send your sensor data
  int httpResponseCode = http.POST(jsonString);
  // Handle response...
}
```

## 🌐 Configure Your Frontend

1. **Create/update `.env` in your React app:**
   ```env
   REACT_APP_IOT_BRIDGE_URL=https://your-app-name.railway.app
   ```

2. **Add to your Dashboard component:**
   ```typescript
   import RealTimeDataPanel from '../components/IoTIntegration/RealTimeDataPanel';
   
   // In your Dashboard JSX:
   <RealTimeDataPanel className="mb-6" />
   ```

## 📊 Railway Dashboard Features

### Monitoring
- **Logs:** View real-time server logs
- **Metrics:** CPU, memory, and network usage
- **Deployments:** History of all deployments

### Scaling (if needed later)
- **Automatic scaling** based on traffic
- **Custom domains** for production
- **Database add-ons** if you need additional storage

## 🚨 Troubleshooting

### Common Issues

1. **"Application failed to start"**
   ```bash
   # Check Railway logs for errors
   # Usually missing environment variables
   ```

2. **"Root directory not found"**
   - Make sure Root Directory is set to `cloud-bridge`
   - Check that package.json exists in cloud-bridge folder

3. **"Database connection failed"**
   - Verify SUPABASE_URL and SUPABASE_ANON_KEY
   - Check if Supabase project is active

4. **"CORS errors from frontend"**
   - Add your frontend domain to ALLOWED_ORIGINS
   - Include both development and production URLs

### Debug Commands

1. **View Logs:**
   - Go to Railway dashboard → Your project → Logs tab
   - Or use Railway CLI: `railway logs`

2. **Check Environment Variables:**
   - Railway dashboard → Variables tab
   - Ensure all required variables are set

3. **Test Endpoints:**
   ```bash
   # Health check
   curl https://your-app-name.railway.app/health
   
   # System status
   curl https://your-app-name.railway.app/api/status
   ```

## 💰 Railway Pricing

**Free Tier (Perfect for IoT projects):**
- $5 credit per month
- Automatic sleep after 30 minutes of inactivity
- Wakes up automatically on first request
- Supports WebSocket connections
- Custom domains available

**Pro Plan ($20/month):**
- $20 credit per month
- No sleeping
- Priority support
- Advanced metrics

## 🔒 Security Best Practices

1. **Change Default API Key:**
   ```env
   ESP32_API_KEY=your-unique-secure-key-here-2024
   ```

2. **Restrict CORS Origins:**
   ```env
   ALLOWED_ORIGINS=https://your-actual-domain.netlify.app
   ```

3. **Monitor Logs:**
   - Check for suspicious API requests
   - Monitor for failed authentication attempts

## 🚀 Next Steps

1. ✅ **Deploy to Railway** (you're doing this now!)
2. ⏭️ **Update ESP32 code** with Railway URL
3. ⏭️ **Update frontend** with Railway URL
4. ⏭️ **Test end-to-end** with real sensor data
5. ⏭️ **Monitor and optimize** based on usage

## 📞 Support

If you encounter issues:

1. **Check Railway logs** in the dashboard
2. **Test with curl commands** to isolate issues
3. **Verify environment variables** are set correctly
4. **Check ESP32 serial monitor** for connection errors

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Health check returns "healthy"
- ✅ ESP32 successfully sends data (check logs)
- ✅ Frontend shows "🟢 Live IoT Data"
- ✅ Real-time data appears in your dashboard

Your Railway deployment is now ready to bridge your ESP32 sensors with your beautiful BioShield dashboard! 🌊📊

---

**Railway URL:** `https://your-app-name.railway.app`  
**Health Check:** `https://your-app-name.railway.app/health`  
**ESP32 Endpoint:** `https://your-app-name.railway.app/api/esp32/data`
