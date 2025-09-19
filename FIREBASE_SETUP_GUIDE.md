# 🔥 Firebase Integration Setup Guide

This guide will help you set up Firebase for real-time ESP32 sensor data integration with your BioShield Environmental Monitor.

## 📋 Prerequisites

- Google account
- Arduino IDE with ESP32 support
- pH and TDS sensors connected to ESP32
- WiFi network for ESP32

## 🚀 Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project"
   - Project name: `bioshield-monitor` (or your preferred name)
   - Enable Google Analytics (optional)
   - Click "Create project"

3. **Enable Realtime Database**
   - In your project dashboard, click "Realtime Database"
   - Click "Create Database"
   - Choose "Start in test mode" (we'll secure it later)
   - Select your preferred location (closest to your region)

## ⚙️ Step 2: Get Firebase Configuration

1. **Web App Configuration**
   - In Project Overview, click the web icon (`</>`)
   - Register app name: `bioshield-web`
   - Copy the configuration object

2. **Update `src/config/firebase.ts`**
   ```typescript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.region.firebaseio.com/",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

3. **Get Database URL**
   - Go to "Realtime Database" in Firebase console
   - Copy the database URL (looks like: `https://your-project-default-rtdb.firebaseio.com/`)

## 🔐 Step 3: Configure Database Security

1. **Set Database Rules**
   - Go to "Realtime Database" → "Rules" tab
   - Replace with these rules for development:
   
   ```json
   {
     "rules": {
       "realtime": {
         ".read": true,
         ".write": true
       },
       "sensorData": {
         ".read": true,
         ".write": true
       },
       "stations": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   
   - Click "Publish"

   **⚠️ Important**: These rules allow public read/write. For production, implement proper authentication!

## 📱 Step 4: ESP32 Setup

### Hardware Connections
```
ESP32 Pin    →    Sensor
GPIO36 (A0)  →    pH Sensor Signal
GPIO39 (A1)  →    TDS Sensor Signal
GPIO4        →    DS18B20 Temperature (optional)
3.3V         →    Sensor VCC
GND          →    Sensor GND
```

### Arduino Libraries Required
Install these libraries in Arduino IDE:

1. **FirebaseESP32** by Mobizt
   - Library Manager → Search "FirebaseESP32" → Install

2. **ArduinoJson** by Benoit Blanchon
   - Library Manager → Search "ArduinoJson" → Install

3. **OneWire** and **DallasTemperature** (for temperature sensor)
   - Library Manager → Search and install both

### Update ESP32 Code
1. Open `esp32_sensor_code.ino` in Arduino IDE

2. **Update WiFi credentials:**
   ```cpp
   const char* WIFI_SSID = "Your_WiFi_Name";
   const char* WIFI_PASSWORD = "Your_WiFi_Password";
   ```

3. **Update Firebase credentials:**
   ```cpp
   #define FIREBASE_HOST "https://your-project-default-rtdb.firebaseio.com/"
   #define FIREBASE_AUTH "your-database-secret"  // Get from Project Settings → Service accounts → Database secrets
   ```

4. **Update station configuration:**
   ```cpp
   const String STATION_ID = "station_001";  // Unique for each ESP32
   const String STATION_NAME = "Your Station Name";
   const String LOCATION = "Your Location";
   const double LATITUDE = 28.6139;   // Your actual coordinates
   const double LONGITUDE = 77.2090;
   ```

## 🌐 Step 5: Update React App

The React app is already configured to use Firebase! Just ensure your Firebase config is correct in `src/config/firebase.ts`.

### Test Firebase Connection

1. **Start the React app:**
   ```bash
   npm run dev
   ```

2. **Open browser console** and look for:
   ```
   🔥 Setting up Firebase real-time listeners...
   ```

3. **Upload and run ESP32 code**
   - The ESP32 should connect to WiFi
   - Send sensor data to Firebase
   - You should see real-time updates in your web app!

## 📊 Step 6: Database Structure

Your Firebase Realtime Database will have this structure:

```
bioshield-monitor/
├── realtime/                    # Current sensor readings
│   ├── station_001/
│   │   ├── stationId: "station_001"
│   │   ├── timestamp: 1640995200000
│   │   ├── ph: 7.2
│   │   ├── tds: 350
│   │   ├── temperature: 25.5
│   │   ├── latitude: 28.6139
│   │   ├── longitude: 77.2090
│   │   └── status: "safe"
│   └── station_002/...
├── sensorData/                  # Historical data
│   ├── station_001/
│   │   ├── -ABC123.../          # Auto-generated keys
│   │   └── -DEF456.../
│   └── station_002/...
└── stations/                    # Station configurations
    ├── station_001/
    │   ├── id: "station_001"
    │   ├── name: "Primary Water Source"
    │   ├── location: "Main Campus"
    │   ├── isActive: true
    │   └── lastUpdated: 1640995200000
    └── station_002/...
```

## 🔧 Step 7: Testing the Integration

### ESP32 Testing
1. **Upload code to ESP32**
2. **Open Serial Monitor (115200 baud)**
3. **Look for these messages:**
   ```
   === BioShield ESP32 Sensor Node ===
   Initializing...
   Connecting to WiFi....
   WiFi connected!
   Firebase configured successfully!
   Setup complete! Starting sensor readings...
   
   === Sensor Readings ===
   Station: station_001
   pH: 7.23
   TDS: 348.50 ppm
   Temperature: 25.30°C
   Status: safe
   Data sent to Firebase successfully!
   ```

### Web App Testing
1. **Open your web app in browser**
2. **Open browser dev tools (F12)**
3. **Look for real-time updates in console**
4. **Check that sensor data appears on dashboard**
5. **Verify map markers show current station status**

## 🛡️ Step 8: Production Security (Important!)

For production deployment, implement proper security:

### Database Rules (Production)
```json
{
  "rules": {
    "realtime": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "sensorData": {
      ".read": "auth != null",
      ".write": "auth != null"  
    },
    "stations": {
      ".read": "auth != null",
      ".write": "auth.uid == 'admin-uid'"
    }
  }
}
```

### ESP32 Authentication
- Use Firebase Admin SDK for server-side authentication
- Implement token-based authentication for ESP32
- Use HTTPS/SSL for all communications

## 🐛 Troubleshooting

### Common Issues

1. **ESP32 won't connect to WiFi**
   - Check SSID and password
   - Ensure 2.4GHz network (ESP32 doesn't support 5GHz)
   - Check signal strength

2. **Firebase connection fails**
   - Verify database URL is correct
   - Check database rules allow read/write
   - Ensure ESP32 time is synchronized

3. **No data in web app**
   - Check browser console for errors
   - Verify Firebase config in React app
   - Test Firebase connection manually

4. **Sensor readings are incorrect**
   - Calibrate pH sensor using buffer solutions
   - Check TDS sensor connections
   - Verify analog pin connections

### Debug Commands

**Test Firebase connection manually:**
```javascript
// In browser console
import { firebaseService } from './src/services/firebaseService';
firebaseService.listenToAllStations(console.log);
```

**ESP32 calibration:**
```cpp
// Call in setup() for sensor calibration
calibratePH();
```

## 📈 Step 9: Scaling and Multiple Stations

To add more ESP32 stations:

1. **Copy ESP32 code to new device**
2. **Change station ID:**
   ```cpp
   const String STATION_ID = "station_002";  // Unique ID
   ```
3. **Update coordinates and location**
4. **Upload to new ESP32**
5. **Station will automatically appear in web app**

## 🎯 Next Steps

1. **Add more sensors** (turbidity, dissolved oxygen, etc.)
2. **Implement data analytics** and trend analysis
3. **Add email/SMS alerts** for dangerous conditions
4. **Create mobile app** using React Native
5. **Add machine learning** for predictive analysis

## 📞 Support

If you encounter issues:
1. Check Firebase console for errors
2. Review ESP32 serial monitor output
3. Check browser console for JavaScript errors
4. Verify all credentials are correct

---

**🎉 Congratulations!** You now have a complete IoT environmental monitoring system with real-time data visualization!