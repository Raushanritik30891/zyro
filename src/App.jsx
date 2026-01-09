import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// --- COMPONENTS ---
import Navbar from './components/Navbar'; 
import Footer from './components/Footer';

// --- PAGES ---
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Matches from './pages/Matches';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Help from './pages/Help';
import Blog from './pages/Blog'; // ✅ Added Blog import

// --- SCROLL TO TOP UTILITY ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- LAYOUT WRAPPER (Navbar + Footer) ---
const Layout = ({ children, hideFooter = false }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<Layout><About /></Layout>} />
<Route path="/blogs" element={<Layout><Blog /></Layout>} />  // /blogs kar do
        
        {/* USER ROUTES */}
        <Route path="/matches" element={<Layout><Matches /></Layout>} />
        <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
        <Route path="/subscription" element={<Layout><Subscription /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/help" element={<Layout><Help /></Layout>} />
        
        {/* PROTECTED ROUTES */}
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        
        {/* ADMIN ROUTE (No Footer, Full Screen) */}
        <Route path="/admin" element={<Admin />} />

        {/* 404 - LOST IN VOID */}
        <Route path="*" element={
          <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-[120px] md:text-[150px] font-gaming font-black text-rosePink leading-none opacity-50">404</h1>
            <p className="text-gray-500 font-gaming uppercase tracking-[0.5em] mb-8">Timeline Not Found</p>
            <a href="/" className="px-8 py-3 border border-white/20 hover:bg-white/10 rounded-xl text-white font-bold uppercase transition-all">
              Return to Base
            </a>
          </div>
        } />

      </Routes>
    </Router>
  );
};

export default App;