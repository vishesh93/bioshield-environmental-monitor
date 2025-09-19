import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DataService } from './services/dataService';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              There was an error loading this component. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  // const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'mock'>('mock');

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      console.log('🔄 Testing Supabase connection...');
      
      // First test basic connection
      const isConnected = await DataService.testConnection();
      
      if (!isConnected) {
        console.log('❌ Basic connection failed, using mock data');
        // setConnectionStatus('error');
        return;
      }

      // Then try to fetch data
      const stations = await DataService.getMonitoringStations();
      
      if (stations.length > 0) {
        console.log('✅ Supabase connected successfully!', stations);
        // setConnectionStatus('connected');
      } else {
        console.log('⚠️ Supabase connected but no data found, using mock data');
        // setConnectionStatus('mock');
      }
    } catch (error) {
      console.log('❌ Supabase connection failed, using mock data:', error);
      // setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  }

  // Removed global loading gate: render the app immediately while background connectivity checks run

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
