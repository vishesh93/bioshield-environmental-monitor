import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Clock, MapPin, Check } from 'lucide-react';
import { Alert } from '../data/mockData';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onClearAll?: () => void;
}

interface AlertPopupProps {
  alert: Alert;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge?: (alertId: string) => void;
}

const AlertPopup = ({ alert, isOpen, onClose, onAcknowledge }: AlertPopupProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'info': return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`
                w-full max-w-md bg-gray-800 rounded-lg border-2 p-6
                ${getTypeColor(alert.type)}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-current" />
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {alert.type} Alert
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-medium">{alert.stationName}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {alert.message}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {alert.timestamp.toLocaleString()}
                  </span>
                </div>

                {!alert.acknowledged && onAcknowledge && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => {
                        onAcknowledge(alert.id);
                        onClose();
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Acknowledge</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AlertsPanel = ({ alerts, onAcknowledge, onClearAll }: AlertsPanelProps) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-400 border-red-500/50';
      case 'warning': return 'text-yellow-400 border-yellow-500/50';
      case 'info': return 'text-blue-400 border-blue-500/50';
      default: return 'text-gray-400 border-gray-500/50';
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10';
      case 'warning': return 'bg-yellow-500/10';
      case 'info': return 'bg-blue-500/10';
      default: return 'bg-gray-500/10';
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Alerts Panel
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">
                {unacknowledgedAlerts.length} Active
              </span>
            </div>
            {unacknowledgedAlerts.length > 0 && onClearAll && (
              <button
                onClick={onClearAll}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {unacknowledgedAlerts.length === 0 && acknowledgedAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No alerts at this time</p>
            </div>
          ) : (
            <>
              {/* Unacknowledged Alerts */}
              {unacknowledgedAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`
                    p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200
                    hover:bg-gray-700/30 ${getTypeBg(alert.type)} ${getTypeColor(alert.type)}
                  `}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-current" />
                        <span className="font-medium text-white text-sm capitalize">
                          {alert.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {alert.stationName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {alert.timestamp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Acknowledged Alerts */}
              {acknowledgedAlerts.length > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Acknowledged</span>
                  </h4>
                  {acknowledgedAlerts.slice(0, 3).map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-3 rounded-lg bg-gray-700/30 border border-gray-600 mb-2 opacity-60"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-sm text-gray-300">
                          {alert.stationName}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {alert.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {alert.message}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      <AlertPopup
        alert={selectedAlert!}
        isOpen={selectedAlert !== null}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={onAcknowledge}
      />
    </>
  );
};

export default AlertsPanel;