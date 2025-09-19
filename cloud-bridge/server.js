const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const WebSocket = require('ws');
const http = require('http');
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

// Rate limiting for ESP32 endpoints
const esp32Limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: { error: 'Too many requests from ESP32' }
});

// Rate limiting for web endpoints
const webLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: { error: 'Too many requests' }
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'your-supabase-url',
  process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key'
);

// In-memory storage for real-time data
let latestSensorData = new Map(); // station_id -> latest reading
let connectedClients = new Set();

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
    service: 'BioShield IoT Bridge',
    version: '1.0.0',
    uptime: process.uptime(),
    connected_clients: connectedClients.size,
    latest_data_count: latestSensorData.size
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
      received_at: new Date().toISOString()
    };

    // Store in memory for real-time access
    latestSensorData.set(parseInt(station_id), sensorReading);

    // Store in Supabase database
    const { data, error } = await supabase
      .from('water_data')
      .upsert([{
        station_id: sensorReading.station_id,
        ph: sensorReading.ph,
        tds: sensorReading.tds,
        temperature: sensorReading.temperature,
        turbidity: sensorReading.turbidity,
        dissolved_oxygen: sensorReading.dissolved_oxygen,
        hmpi: calculateHMPI(sensorReading),
        created_at: sensorReading.received_at
      }], {
        onConflict: 'station_id'
      });

    if (error) {
      console.error('Database error:', error);
      // Continue even if database fails - we have in-memory data
    }

    // Broadcast to connected web clients
    broadcastToClients({
      type: 'sensor_data',
      station_id: sensorReading.station_id,
      data: sensorReading
    });

    console.log(`📊 Data received from station ${station_id}: pH=${ph}, TDS=${tds}`);

    res.json({
      success: true,
      message: 'Data received and processed',
      station_id: sensorReading.station_id,
      timestamp: sensorReading.received_at
    });

  } catch (error) {
    console.error('ESP32 data processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Bulk data endpoint for multiple readings
app.post('/api/esp32/bulk', esp32Limiter, authenticateESP32, async (req, res) => {
  try {
    const { readings } = req.body;

    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Expected array of readings'
      });
    }

    const processedReadings = [];
    const dbInserts = [];

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
        received_at: new Date().toISOString()
      };

      // Update in-memory storage with latest reading
      latestSensorData.set(processed.station_id, processed);
      processedReadings.push(processed);

      // Prepare for database insert
      dbInserts.push({
        station_id: processed.station_id,
        ph: processed.ph,
        tds: processed.tds,
        temperature: processed.temperature,
        turbidity: processed.turbidity,
        dissolved_oxygen: processed.dissolved_oxygen,
        hmpi: calculateHMPI(processed),
        created_at: processed.received_at
      });
    }

    // Bulk insert to database
    if (dbInserts.length > 0) {
      const { error } = await supabase
        .from('water_data')
        .insert(dbInserts);

      if (error) {
        console.error('Bulk database error:', error);
      }
    }

    // Broadcast all readings to clients
    processedReadings.forEach(reading => {
      broadcastToClients({
        type: 'sensor_data',
        station_id: reading.station_id,
        data: reading
      });
    });

    res.json({
      success: true,
      message: `${processedReadings.length} readings processed`,
      processed_count: processedReadings.length
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
app.get('/api/sensors/latest', webLimiter, async (req, res) => {
  try {
    const latestData = Array.from(latestSensorData.values());
    
    // If no in-memory data, try to fetch from database
    if (latestData.length === 0) {
      const { data, error } = await supabase
        .from('water_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        // Convert database format to our format
        const convertedData = data.map(row => ({
          station_id: row.station_id,
          device_id: 'DATABASE',
          ph: row.ph,
          tds: row.tds,
          temperature: row.temperature,
          turbidity: row.turbidity,
          dissolved_oxygen: row.dissolved_oxygen,
          timestamp: row.created_at,
          received_at: row.created_at
        }));

        return res.json({
          success: true,
          data: convertedData,
          source: 'database',
          count: convertedData.length
        });
      }
    }

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
app.get('/api/sensors/station/:stationId', webLimiter, async (req, res) => {
  try {
    const stationId = parseInt(req.params.stationId);
    const { hours = 24, limit = 100 } = req.query;

    // Get from memory first
    const latestReading = latestSensorData.get(stationId);

    // Get historical data from database
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - parseInt(hours));

    const { data: historicalData, error } = await supabase
      .from('water_data')
      .select('*')
      .eq('station_id', stationId)
      .gte('created_at', hoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    res.json({
      success: true,
      station_id: stationId,
      latest: latestReading || null,
      historical: historicalData || [],
      count: (historicalData || []).length
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
  const stationStatus = Array.from(latestSensorData.entries()).map(([stationId, data]) => {
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
    active_stations: latestSensorData.size,
    stations: stationStatus,
    server_uptime: process.uptime(),
    memory_usage: process.memoryUsage()
  });
});

// ==================== WEBSOCKET REAL-TIME UPDATES ====================
wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket client connected');
  connectedClients.add(ws);

  // Send current data to new client
  const currentData = Array.from(latestSensorData.values());
  ws.send(JSON.stringify({
    type: 'initial_data',
    data: currentData,
    timestamp: new Date().toISOString()
  }));

  // Handle client messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received from client:', data);

      // Handle subscription requests
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
      // Send to all clients or filter by station subscription
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
  // Simplified Heavy Metal Pollution Index calculation
  let hmpi = 0;
  
  // pH contribution
  if (reading.ph < 6.5 || reading.ph > 8.5) {
    hmpi += Math.abs(reading.ph - 7) * 0.1;
  }
  
  // TDS contribution
  if (reading.tds > 500) {
    hmpi += (reading.tds - 500) * 0.001;
  }
  
  // Temperature contribution
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
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available_endpoints: [
      'POST /api/esp32/data',
      'POST /api/esp32/bulk',
      'GET /api/sensors/latest',
      'GET /api/sensors/station/:stationId',
      'GET /api/status',
      'GET /health'
    ]
  });
});

// ==================== SERVER STARTUP ====================
server.listen(PORT, () => {
  console.log(`🚀 BioShield IoT Bridge Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket server enabled for real-time updates`);
  console.log(`🌐 CORS enabled for frontend integration`);
  console.log(`🔐 ESP32 API authentication enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
