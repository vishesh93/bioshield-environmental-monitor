# BioShield IoT Bridge - Deployment Guide

This guide will help you deploy the IoT Bridge server that connects your ESP32 sensors to your website.

## Deployment Options

### Option 1: Railway (Recommended - Free tier available)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   ```bash
   # Push your cloud-bridge folder to GitHub
   git add cloud-bridge/
   git commit -m "Add IoT bridge server"
   git push origin main
   ```

3. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose the `cloud-bridge` folder as root directory

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=3001
   SUPABASE_URL=your-actual-supabase-url
   SUPABASE_ANON_KEY=your-actual-supabase-anon-key
   ESP32_API_KEY=bioshield-esp32-key-2024
   ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app,http://localhost:3000
   ```

5. **Deploy**
   - Railway will automatically deploy
   - Note your deployment URL (e.g., `https://your-app.railway.app`)

### Option 2: Render (Free tier available)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set root directory to `cloud-bridge`

3. **Configure Service**
   ```
   Name: bioshield-iot-bridge
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables** (same as Railway)

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   # Download from heroku.com/cli
   ```

2. **Deploy**
   ```bash
   cd cloud-bridge
   heroku create bioshield-iot-bridge
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=your-actual-supabase-url
   heroku config:set SUPABASE_ANON_KEY=your-actual-supabase-anon-key
   heroku config:set ESP32_API_KEY=bioshield-esp32-key-2024
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a bioshield-iot-bridge
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Create DigitalOcean Account**
   - Go to [digitalocean.com](https://digitalocean.com)

2. **Create App**
   - Apps → Create App
   - Connect GitHub repository
   - Select `cloud-bridge` folder

3. **Configure**
   - Runtime: Node.js
   - Build Command: `npm install`
   - Run Command: `npm start`

## Configuration

### 1. Update Environment Variables

Create `.env` file in `cloud-bridge` folder:
```env
# Copy from .env.example and update these values:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
ESP32_API_KEY=your-secure-api-key-here
ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app
```

### 2. Update Frontend Configuration

Add to your React app's `.env` file:
```env
REACT_APP_IOT_BRIDGE_URL=https://your-deployed-bridge-url.railway.app
```

## Testing the Deployment

### 1. Health Check
```bash
curl https://your-deployed-url.railway.app/health
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

### 2. Test ESP32 Endpoint
```bash
curl -X POST https://your-deployed-url.railway.app/api/esp32/data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "station_id": 1,
    "ph": 7.2,
    "tds": 450,
    "temperature": 25.5
  }'
```

### 3. Test Web API
```bash
curl https://your-deployed-url.railway.app/api/sensors/latest
```

## ESP32 Integration

Update your ESP32 code to use the deployed URL:

```cpp
// In your ESP32 code
const char* SERVER_URL = "https://your-deployed-url.railway.app/api/esp32/data";
const char* API_KEY = "your-api-key";
```

## Frontend Integration

Update your React app to use the IoT bridge:

```typescript
// In your React component
import { useIoTData } from '../hooks/useIoTData';

function Dashboard() {
  const { latestData, isConnected, error } = useIoTData({
    autoConnect: true,
    refreshInterval: 30000
  });

  return (
    <div>
      <h1>Real-time Sensor Data</h1>
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      {latestData.map(reading => (
        <div key={reading.station_id}>
          <h3>Station {reading.station_id}</h3>
          <p>pH: {reading.ph}</p>
          <p>TDS: {reading.tds} ppm</p>
          <p>Temperature: {reading.temperature}°C</p>
        </div>
      ))}
    </div>
  );
}
```

## Monitoring

### 1. Check Logs
```bash
# Railway
railway logs

# Render
# Check logs in dashboard

# Heroku
heroku logs --tail -a bioshield-iot-bridge
```

### 2. Monitor System Status
Visit: `https://your-deployed-url.railway.app/api/status`

### 3. WebSocket Testing
Use browser console:
```javascript
const ws = new WebSocket('wss://your-deployed-url.railway.app');
ws.onmessage = (event) => console.log('Received:', JSON.parse(event.data));
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your frontend domain is in `ALLOWED_ORIGINS`
   - Check environment variables are set correctly

2. **Database Connection Issues**
   - Verify Supabase URL and key
   - Check if your Supabase project is active

3. **ESP32 Can't Connect**
   - Verify the deployed URL is accessible
   - Check API key matches
   - Ensure ESP32 has internet connectivity

4. **WebSocket Issues**
   - Some platforms may not support WebSocket upgrades
   - Check platform-specific WebSocket configuration

### Debug Mode

Enable debug logging:
```env
DEBUG_MODE=true
LOG_LEVEL=debug
```

## Security Notes

1. **Change Default API Key**
   ```env
   ESP32_API_KEY=your-unique-secure-key-here
   ```

2. **Restrict CORS Origins**
   ```env
   ALLOWED_ORIGINS=https://your-actual-domain.com
   ```

3. **Use HTTPS**
   - All deployment platforms provide HTTPS by default
   - Never use HTTP in production

## Scaling

For high-traffic scenarios:

1. **Enable Rate Limiting**
   ```env
   RATE_LIMIT_MAX_REQUESTS=100
   RATE_LIMIT_WINDOW_MS=60000
   ```

2. **Database Optimization**
   - Consider using connection pooling
   - Implement data archiving for old records

3. **Caching**
   - Add Redis for caching latest sensor data
   - Implement response caching

## Support

If you encounter issues:

1. Check the health endpoint
2. Review server logs
3. Verify environment variables
4. Test with curl commands
5. Check network connectivity

Your IoT Bridge is now ready to connect your ESP32 sensors to your website! 🚀
