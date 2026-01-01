import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// 👇 Ye line honi chahiye
import { NotificationProvider } from './context/NotificationContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 👇 App iske andar hona chahiye */}
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>,
);