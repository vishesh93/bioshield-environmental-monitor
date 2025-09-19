const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server });

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://your-frontend-domain.netlify.app'],
  credentials: true
}));

// Rate limiting
const esp32Limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: { error: 'Too many requests from ESP32' }
});

const webLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: { error: 'Too many requests' }
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory storage for sensor data
let sensorData = new Map(); // station_id -> array of readings
let latestReadings = new Map(); // station_id -> latest reading
let connectedClients = new Set();
let systemStats = {
  startTime: new Date(),
  totalReadings: 0,
  activeStations: new Set()
};

// File-based persistence (optional backup)
const DATA_FILE = path.join(__dirname, 'sensor_data.json');

// Load existing data on startup
async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Restore data from file
    if (parsed.sensorData) {
      sensorData = new Map(Object.entries(parsed.sensorData));
    }
    if (parsed.latestReadings) {
      latestReadings = new Map(Object.entries(parsed.latestReadings));
    }
    if (parsed.systemStats) {
      systemStats = { ...systemStats, ...parsed.systemStats };
      systemStats.activeStations = new Set(parsed.systemStats.activeStations || []);
    }
    
    console.log('📊 Loaded existing sensor data:', sensorData.size, 'stations');
  } catch (error) {
    console.log('📊 Starting with fresh data (no existing file)');
  }
}

// Save data to file (backup)
async function saveData() {
  try {
    const dataToSave = {
      sensorData: Object.fromEntries(sensorData),
      latestReadings: Object.fromEntries(latestReadings),
      systemStats: {
        ...systemStats,
        activeStations: Array.from(systemStats.activeStations)
      },
      lastSaved: new Date().toISOString()
    };
    
    await fs.writeFile(DATA_FILE, JSON.stringify(dataToSave, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// ESP32 Authentication middleware
const authenticateESP32 = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const validKey = process.env.ESP32_API_KEY || 'bioshield-esp32-key-2024';
  
  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized - Invalid API key' 
    });
  }
  next();
};

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'BioShield IoT Bridge (Standalone)',
    version: '1.0.0',
    uptime: Math.floor((Date.now() - systemStats.startTime.getTime()) / 1000),
    connected_clients: connectedClients.size,
    active_stations: systemStats.activeStations.size,
    total_readings: systemStats.totalReadings
  });
});

// ==================== ESP32 DATA INGESTION ====================
app.post('/api/esp32/data', esp32Limiter, authenticateESP32, async (req, res) => {
  try {
    const { 
      station_id, 
      ph, 
      tds, 
      temperature, 
      turbidity, 
      dissolved_oxygen,
      device_id = 'ESP32_DEFAULT',
      timestamp 
    } = req.body;

    // Validate required fields
    if (!station_id || ph === undefined || tds === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: station_id, ph, tds'
      });
    }

    // Validate data ranges
    if (ph < 0 || ph > 14 || tds < 0 || tds > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sensor values - pH must be 0-14, TDS must be 0-10000'
      });
    }

    const sensorReading = {
      station_id: parseInt(station_id),
      device_id,
      ph: parseFloat(ph),
      tds: parseFloat(tds),
      temperature: temperature ? parseFloat(temperature) : null,
      turbidity: turbidity ? parseFloat(turbidity) : null,
      dissolved_oxygen: dissolved_oxygen ? parseFloat(dissolved_oxygen) : null,
      timestamp: timestamp || new Date().toISOString(),
      received_at: new Date().toISOString(),
      hmpi: calculateHMPI({ ph, tds, temperature, turbidity, dissolved_oxygen })
    };

    const stationId = parseInt(station_id);

    // Store in memory
    if (!sensorData.has(stationId)) {
      sensorData.set(stationId, []);
    }
    
    // Keep last 1000 readings per station
    const stationReadings = sensorData.get(stationId);
    stationReadings.push(sensorReading);
    if (stationReadings.length > 1000) {
      stationReadings.shift(); // Remove oldest
    }

    // Update latest reading
    latestReadings.set(stationId, sensorReading);

    // Update system stats
    systemStats.totalReadings++;
    systemStats.activeStations.add(stationId);

    // Broadcast to connected web clients
    broadcastToClients({
      type: 'sensor_data',
      station_id: stationId,
      data: sensorReading
    });

    // Save data periodically (every 10 readings)
    if (systemStats.totalReadings % 10 === 0) {
      saveData();
    }

    console.log(`📊 Data received from station ${station_id}: pH=${ph}, TDS=${tds}`);

    res.json({
      success: true,
      message: 'Data received and stored',
      station_id: stationId,
      timestamp: sensorReading.received_at,
      total_readings: systemStats.totalReadings
    });

  } catch (error) {
    console.error('ESP32 data processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Bulk data endpoint
app.post('/api/esp32/bulk', esp32Limiter, authenticateESP32, async (req, res) => {
  try {
    const { readings } = req.body;

    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Expected array of readings'
      });
    }

    let processedCount = 0;

    for (const reading of readings) {
      if (!reading.station_id || reading.ph === undefined || reading.tds === undefined) {
        continue; // Skip invalid readings
      }

      const processed = {
        station_id: parseInt(reading.station_id),
        device_id: reading.device_id || 'ESP32_DEFAULT',
        ph: parseFloat(reading.ph),
        tds: parseFloat(reading.tds),
        temperature: reading.temperature ? parseFloat(reading.temperature) : null,
        turbidity: reading.turbidity ? parseFloat(reading.turbidity) : null,
        dissolved_oxygen: reading.dissolved_oxygen ? parseFloat(reading.dissolved_oxygen) : null,
        timestamp: reading.timestamp || new Date().toISOString(),
        received_at: new Date().toISOString(),
        hmpi: calculateHMPI(reading)
      };

      const stationId = processed.station_id;

      // Store in memory
      if (!sensorData.has(stationId)) {
        sensorData.set(stationId, []);
      }
      
      sensorData.get(stationId).push(processed);
      latestReadings.set(stationId, processed);
      systemStats.activeStations.add(stationId);
      
      // Broadcast to clients
      broadcastToClients({
        type: 'sensor_data',
        station_id: stationId,
        data: processed
      });

      processedCount++;
    }

    systemStats.totalReadings += processedCount;
    saveData(); // Save after bulk insert

    res.json({
      success: true,
      message: `${processedCount} readings processed`,
      processed_count: processedCount
    });

  } catch (error) {
    console.error('Bulk data processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ==================== WEB CLIENT API ENDPOINTS ====================

// Get latest sensor data for all stations
app.get('/api/sensors/latest', webLimiter, (req, res) => {
  try {
    const latestData = Array.from(latestReadings.values());
    
    res.json({
      success: true,
      data: latestData,
      source: 'memory',
      count: latestData.length,
      last_updated: latestData.length > 0 ? Math.max(...latestData.map(d => new Date(d.received_at).getTime())) : null
    });

  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor data'
    });
  }
});

// Get data for specific station
app.get('/api/sensors/station/:stationId', webLimiter, (req, res) => {
  try {
    const stationId = parseInt(req.params.stationId);
    const { hours = 24, limit = 100 } = req.query;

    // Get latest reading
    const latestReading = latestReadings.get(stationId);

    // Get historical data
    const stationReadings = sensorData.get(stationId) || [];
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - parseInt(hours));

    const historicalData = stationReadings
      .filter(reading => new Date(reading.received_at) >= hoursAgo)
      .slice(-parseInt(limit))
      .reverse(); // Most recent first

    res.json({
      success: true,
      station_id: stationId,
      latest: latestReading || null,
      historical: historicalData,
      count: historicalData.length
    });

  } catch (error) {
    console.error('Error fetching station data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch station data'
    });
  }
});

// Get system status
app.get('/api/status', webLimiter, (req, res) => {
  const now = new Date();
  const stationStatus = Array.from(latestReadings.entries()).map(([stationId, data]) => {
    const lastUpdate = new Date(data.received_at);
    const minutesAgo = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    return {
      station_id: stationId,
      device_id: data.device_id,
      status: minutesAgo < 10 ? 'online' : minutesAgo < 60 ? 'warning' : 'offline',
      last_seen: data.received_at,
      minutes_ago: Math.round(minutesAgo),
      latest_values: {
        ph: data.ph,
        tds: data.tds,
        temperature: data.temperature
      }
    };
  });

  res.json({
    success: true,
    system_status: 'operational',
    connected_clients: connectedClients.size,
    active_stations: systemStats.activeStations.size,
    total_readings: systemStats.totalReadings,
    uptime_seconds: Math.floor((Date.now() - systemStats.startTime.getTime()) / 1000),
    stations: stationStatus,
    memory_usage: process.memoryUsage()
  });
});

// ==================== WEBSOCKET REAL-TIME UPDATES ====================
wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket client connected');
  connectedClients.add(ws);

  // Send current data to new client
  const currentData = Array.from(latestReadings.values());
  ws.send(JSON.stringify({
    type: 'initial_data',
    data: currentData,
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe' && data.station_id) {
        ws.station_id = data.station_id;
        ws.send(JSON.stringify({
          type: 'subscribed',
          station_id: data.station_id,
          message: `Subscribed to station ${data.station_id}`
        }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    connectedClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    connectedClients.delete(ws);
  });
});

// Broadcast data to all connected clients
function broadcastToClients(message) {
  const messageStr = JSON.stringify({
    ...message,
    timestamp: new Date().toISOString()
  });

  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      if (!client.station_id || client.station_id === message.station_id) {
        client.send(messageStr);
      }
    } else {
      connectedClients.delete(client);
    }
  });
}

// ==================== UTILITY FUNCTIONS ====================
function calculateHMPI(reading) {
  let hmpi = 0;
  
  if (reading.ph < 6.5 || reading.ph > 8.5) {
    hmpi += Math.abs(reading.ph - 7) * 0.1;
  }
  
  if (reading.tds > 500) {
    hmpi += (reading.tds - 500) * 0.001;
  }
  
  if (reading.temperature && (reading.temperature < 10 || reading.temperature > 30)) {
    hmpi += Math.abs(reading.temperature - 20) * 0.01;
  }
  
  return Math.round(hmpi * 1000) / 1000;
}

// ==================== ERROR HANDLING ====================
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available_endpoints: [
      'POST /api/esp32/data',
      'GET /api/sensors/latest',
      'GET /api/sensors/station/:stationId',
      'GET /api/status',
      'GET /health'
    ]
  });
});

// ==================== SERVER STARTUP ====================
async function startServer() {
  await loadData();
  
  server.listen(PORT, () => {
    console.log(`🚀 BioShield IoT Bridge (Standalone) running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 WebSocket server enabled`);
    console.log(`💾 Data persistence enabled`);
    console.log(`📈 Loaded ${systemStats.totalReadings} total readings`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, saving data and shutting down...');
  await saveData();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, saving data and shutting down...');
  await saveData();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Save data every 5 minutes
setInterval(saveData, 5 * 60 * 1000);

startServer();

module.exports = app;
