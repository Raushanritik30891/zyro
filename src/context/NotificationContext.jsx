import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

// --- 🛡️ SAFETY CHECK HOOK ---
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // --- ADD NOTIFICATION ---
  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  // --- REMOVE NOTIFICATION ---
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      
      {/* --- NOTIFICATION CONTAINER (Fixed Top-Right) --- */}
      <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(({ id, type, message }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              layout
              className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 relative overflow-hidden group
                ${type === 'success' ? 'bg-green-900/80 border-green-500/30' : 
                  type === 'error' ? 'bg-red-900/80 border-red-500/30' : 
                  'bg-gray-900/80 border-rosePink/30'}`}
            >
              {/* Glowing Line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                type === 'success' ? 'bg-green-500' : 
                type === 'error' ? 'bg-red-500' : 'bg-rosePink'
              }`}></div>

              {/* Icon */}
              <div className={`mt-0.5 ${
                type === 'success' ? 'text-green-400' : 
                type === 'error' ? 'text-red-400' : 'text-rosePink'
              }`}>
                {type === 'success' ? <CheckCircle size={20} /> : 
                 type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                  type === 'success' ? 'text-green-200' : 
                  type === 'error' ? 'text-red-200' : 'text-rose-200'
                }`}>
                  {type === 'success' ? 'System Success' : type === 'error' ? 'System Error' : 'New Transmission'}
                </h4>
                <p className="text-xs font-bold text-white leading-relaxed">{message}</p>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => removeNotification(id)}
                className="text-white/20 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};