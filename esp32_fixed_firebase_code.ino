/*
 * BioShield Environmental Monitor - ESP32 Sensor Node (Fixed Version)
 * This version works with the current FirebaseESP32 library!
 */

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>
#include <time.h>

// WiFi credentials - UPDATE THESE WITH YOUR ACTUAL WIFI
const char* WIFI_SSID = "YOUR_WIFI_SSID";  // ⚠️ CHANGE THIS TO YOUR WIFI NAME
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";  // ⚠️ CHANGE THIS TO YOUR WIFI PASSWORD

// Firebase credentials - UPDATED WITH YOUR PROJECT CONFIG
#define FIREBASE_HOST "https://bioshield-c2443-default-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "AIzaSyDyK-PGp16Iiwze--e5UkEooUuVGTw26CU"

// Pin definitions for ESP32 Dev Kit
#define PH_SENSOR_PIN 34      // GPIO34 (Analog Input)
#define TDS_SENSOR_PIN 35     // GPIO35 (Analog Input)
#define TEMP_SENSOR_PIN 4     // GPIO4 for DS18B20 (optional)
#define LED_PIN 2             // Built-in LED

// Sensor calibration values
#define PH_NEUTRAL_VOLTAGE 1500  // mV at pH 7.0
#define PH_ACID_VOLTAGE 2000     // mV at pH 4.0
#define TDS_VREF 3.3             // Reference voltage
#define TDS_SCOUNT 30            // Sample count for averaging

// Station configuration
const String STATION_ID = "station_001";  // Change this for each ESP32
const String STATION_NAME = "Primary Water Source";
const String LOCATION = "Main Campus";
const double LATITUDE = 28.6139;   // New Delhi coordinates (change to your location)
const double LONGITUDE = 77.2090;

// Firebase objects
FirebaseData firebaseData;
FirebaseConfig config;
FirebaseAuth auth;

// Temperature sensor setup
OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature tempSensor(&oneWire);

// Global variables
float temperature = 0.0;
float phValue = 0.0;
float tdsValue = 0.0;
int analogBuffer[TDS_SCOUNT];
int analogBufferTemp[TDS_SCOUNT];
int analogBufferIndex = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  // Initialize temperature sensor
  tempSensor.begin();
  
  Serial.println("\n=== BioShield ESP32 Sensor Node ===");
  Serial.println("Initializing...");
  
  // Connect to WiFi
  connectToWiFi();
  
  // Configure Firebase
  configureFirebase();
  
  // Initialize time
  configTime(0, 0, "pool.ntp.org");
  
  Serial.println("Setup complete! Starting sensor readings...");
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
}

void loop() {
  // Read all sensors
  readSensors();
  
  // Calculate status
  String status = calculateStatus(phValue, tdsValue);
  
  // Send data to Firebase
  sendToFirebase(phValue, tdsValue, temperature, status);
  
  // Print data to Serial Monitor
  printSensorData();
  
  // Blink LED to indicate data sent
  blinkLED(3);
  
  // Wait before next reading (30 seconds)
  delay(30000);
}

void connectToWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void configureFirebase() {
  // Configure Firebase - FIXED VERSION
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("Firebase configured successfully!");
}

void readSensors() {
  // Read temperature
  tempSensor.requestTemperatures();
  temperature = tempSensor.getTempCByIndex(0);
  if (temperature == DEVICE_DISCONNECTED_C) {
    temperature = 25.0; // Default temperature
  }
  
  // Read pH sensor
  int phAnalogValue = analogRead(PH_SENSOR_PIN);
  float voltage = phAnalogValue * (3.3 / 4095.0) * 1000; // Convert to mV
  phValue = 7.0 + ((PH_NEUTRAL_VOLTAGE - voltage) / ((PH_ACID_VOLTAGE - PH_NEUTRAL_VOLTAGE) / -3.0));
  
  // Read TDS sensor with averaging
  static unsigned long analogSampleTimepoint = millis();
  if (millis() - analogSampleTimepoint > 40U) {
    analogSampleTimepoint = millis();
    analogBuffer[analogBufferIndex] = analogRead(TDS_SENSOR_PIN);
    analogBufferIndex++;
    if (analogBufferIndex == TDS_SCOUNT) {
      analogBufferIndex = 0;
    }
  }
  
  // Calculate TDS
  static unsigned long printTimepoint = millis();
  if (millis() - printTimepoint > 800U) {
    printTimepoint = millis();
    for (int i = 0; i < TDS_SCOUNT; i++) {
      analogBufferTemp[i] = analogBuffer[i];
    }
    
    // Get median value
    float averageVoltage = getMedianNum(analogBufferTemp, TDS_SCOUNT) * TDS_VREF / 4095.0;
    float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0);
    float compensationVoltage = averageVoltage / compensationCoefficient;
    tdsValue = (133.42 * compensationVoltage * compensationVoltage * compensationVoltage 
               - 255.86 * compensationVoltage * compensationVoltage 
               + 857.39 * compensationVoltage) * 0.5;
  }
}

int getMedianNum(int bArray[], int iFilterLen) {
  int bTab[iFilterLen];
  for (int i = 0; i < iFilterLen; i++) {
    bTab[i] = bArray[i];
  }
  
  int i, j, bTemp;
  for (j = 0; j < iFilterLen - 1; j++) {
    for (i = 0; i < iFilterLen - j - 1; i++) {
      if (bTab[i] > bTab[i + 1]) {
        bTemp = bTab[i];
        bTab[i] = bTab[i + 1];
        bTab[i + 1] = bTemp;
      }
    }
  }
  
  if ((iFilterLen & 1) > 0) {
    bTemp = bTab[(iFilterLen - 1) / 2];
  } else {
    bTemp = (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
  }
  
  return bTemp;
}

String calculateStatus(float ph, float tds) {
  if (ph < 6.0 || ph > 9.0 || tds > 1000) {
    return "danger";
  } else if (ph < 6.5 || ph > 8.5 || tds > 500) {
    return "caution";
  }
  return "safe";
}

// FIXED: Send data to Firebase using the correct library functions
void sendToFirebase(float ph, float tds, float temp, String status) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected!");
    return;
  }

  // Create FirebaseJson object (required by new library)
  FirebaseJson json;
  
  // Add data to JSON object
  json.set("stationId", STATION_ID);
  json.set("timestamp", getTimestamp());
  json.set("ph", ph);
  json.set("tds", tds);
  json.set("temperature", temp);
  json.set("latitude", LATITUDE);
  json.set("longitude", LONGITUDE);
  json.set("status", status);

  // Send to real-time path
  String realtimePath = "/realtime/" + STATION_ID;
  if (Firebase.setJSON(firebaseData, realtimePath, json)) {
    Serial.println("✅ Real-time data sent successfully!");
  } else {
    Serial.println("❌ Failed to send real-time data:");
    Serial.println(firebaseData.errorReason());
  }
  
  // Send to historical data path
  String historicalPath = "/sensorData/" + STATION_ID;
  if (Firebase.pushJSON(firebaseData, historicalPath, json)) {
    Serial.println("✅ Historical data saved!");
  } else {
    Serial.println("❌ Failed to save historical data:");
    Serial.println(firebaseData.errorReason());
  }
}

void printSensorData() {
  Serial.println("\n=== Sensor Readings ===");
  Serial.println("Station: " + STATION_ID);
  Serial.println("pH: " + String(phValue, 2));
  Serial.println("TDS: " + String(tdsValue, 2) + " ppm");
  Serial.println("Temperature: " + String(temperature, 2) + "°C");
  Serial.println("Status: " + calculateStatus(phValue, tdsValue));
  Serial.println("Timestamp: " + String(getTimestamp()));
  Serial.println("========================\n");
}

unsigned long getTimestamp() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return millis(); // Fallback to millis
  }
  time(&now);
  return now * 1000; // Convert to milliseconds
}

void blinkLED(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
}

// Calibration helper function
void calibratePH() {
  Serial.println("=== pH Sensor Calibration ===");
  Serial.println("Place sensor in pH 7.0 buffer solution and press Enter...");
  
  while (!Serial.available()) {
    delay(100);
  }
  Serial.read(); // Clear buffer
  
  int sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(PH_SENSOR_PIN);
    delay(100);
  }
  
  int neutralVoltage = (sum / 10) * (3.3 / 4095.0) * 1000;
  Serial.println("pH 7.0 calibration: " + String(neutralVoltage) + "mV");
  
  Serial.println("Place sensor in pH 4.0 buffer solution and press Enter...");
  while (!Serial.available()) {
    delay(100);
  }
  Serial.read(); // Clear buffer
  
  sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(PH_SENSOR_PIN);
    delay(100);
  }
  
  int acidVoltage = (sum / 10) * (3.3 / 4095.0) * 1000;
  Serial.println("pH 4.0 calibration: " + String(acidVoltage) + "mV");
  
  Serial.println("Calibration complete! Update the constants in your code:");
  Serial.println("#define PH_NEUTRAL_VOLTAGE " + String(neutralVoltage));
  Serial.println("#define PH_ACID_VOLTAGE " + String(acidVoltage));
}