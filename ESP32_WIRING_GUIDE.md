# 🔌 ESP32 Dev Kit Wiring Guide - Your Setup

## 📋 Your Hardware:
- **ESP32 Dev Kit**
- **pH Sensor** → GPIO34
- **TDS Sensor** → GPIO35
- **Temperature Sensor** → GPIO4 (optional)

## 🔗 Wiring Connections:

### pH Sensor Wiring:
```
pH Sensor    →    ESP32 Dev Kit
---------          -------------
VCC (Red)    →    3.3V
GND (Black)  →    GND  
Signal       →    GPIO34
```

### TDS Sensor Wiring:
```
TDS Sensor   →    ESP32 Dev Kit
----------         -------------
VCC (Red)    →    3.3V
GND (Black)  →    GND
Signal       →    GPIO35
```

### Temperature Sensor (Optional):
```
DS18B20      →    ESP32 Dev Kit
-------            -------------
VCC (Red)    →    3.3V
GND (Black)  →    GND
Data         →    GPIO4
```

## 🎯 Visual Layout:
```
        ESP32 Dev Kit (Top View)
        ┌─────────────────────┐
    3.3V│●                   ●│GND
        │                     │
        │                     │
  GPIO4 │●                   ●│ (other pins)
        │                     │
        │                     │
 GPIO34 │●                   ●│ (other pins)
        │                     │
 GPIO35 │●                   ●│ (other pins)
        └─────────────────────┘
```

## ⚡ Power Supply Notes:
- **3.3V is enough** for most pH and TDS sensors
- If sensors need 5V, connect VCC to **VIN pin** instead
- **Always connect GND** to complete the circuit
- USB cable powers the ESP32

## 🔧 Sensor Tips:
- **pH Sensor**: Usually comes with a probe and circuit board
- **TDS Sensor**: Usually has 2-3 wires (VCC, GND, Signal)
- **Make sure connections are tight** - loose wires cause bad readings!

## 🚨 Safety Check:
✅ 3.3V to VCC
✅ GND to GND  
✅ Signal wires to correct GPIO pins (34 & 35)
✅ No loose connections
✅ ESP32 powered via USB