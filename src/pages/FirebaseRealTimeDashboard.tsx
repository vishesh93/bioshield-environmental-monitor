// Real-time ESP32 sensor data dashboard
import React from 'react';
import FirebaseRealTimeDashboard from '../components/FirebaseRealTimeDashboard';

const FirebaseRealTimePage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20">
      <FirebaseRealTimeDashboard />
    </div>
  );
};

export default FirebaseRealTimePage;