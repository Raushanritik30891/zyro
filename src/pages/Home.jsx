import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Crown, Zap, MessageCircle, Star, Shield, Trophy, 
  ArrowRight, Flame, Target, Users, TrendingUp, Sparkles, Gift, CheckCircle, Award,
  Home as HomeIcon, Swords, User, Menu, X
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Asset Check
import blackGokuImg from '../assets/goku.png';

const Home = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  
  const floatingAnimation = {
    animate: { 
      y: [0, -20, 0],
      transition: { 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Mobile menu close when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon size={22} /> },
    { path: '/matches', label: 'Matches', icon: <Swords size={22} /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={22} /> },
    { path: '/profile', label: 'Profile', icon: <User size={22} /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Swords size={20} />
            </div>
            <span className="font-bold text-lg">Zyro Esports</span>
          </div>
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 p-4 border-t border-gray-800 hover:bg-gray-800"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <Link
              to="/subscription"
              className="flex items-center gap-3 p-4 border-t border-gray-800 bg-gradient-to-r from-pink-600 to-purple-600"
            >
              <Crown size={20} />
              <span className="font-bold">Get Premium</span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="pt-16 md:pt-28 pb-24 md:pb-12">
        {/* --- 1. HERO SECTION (Black Goku Style) --- */}
        <div className="relative px-4 flex flex-col items-center justify-center text-center z-10 overflow-hidden">
          {/* Animated Background Atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-pink-500/10 blur-[100px] rounded-full animate-pulse"></div>

          {/* Visual Anchor (Goku) */}
          <motion.div 
            variants={floatingAnimation}
            animate="animate"
            className="relative z-10"
          >
            <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-[10px] font-bold px-3 md:px-4 py-1 rounded shadow-lg uppercase tracking-wider whitespace-nowrap">
              <span className="flex items-center gap-2">
                <Target size={10} /> OFFICIAL E-SPORTS HUB
              </span>
            </div>
            
            <img 
              src={blackGokuImg} 
              alt="Black Goku" 
              className="h-[200px] md:h-[480px] w-auto object-contain drop-shadow-[0_0_40px_rgba(244,63,94,0.5)]"
            />
          </motion.div>

          {/* Main Content */}
          <div className="mt-4 md:mt-8 max-w-4xl mx-auto space-y-4 md:space-y-6 relative z-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-7xl font-bold leading-tight md:leading-none"
            >
              DOMINATE THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-white to-purple-500 animate-gradient">
                BATTLEGROUND
              </span>
            </motion.h1>
            
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto px-4">
              Zyro E-Sports is the ultimate AI-powered dimension for elite gamers. 
              Matches on WhatsApp. Glory on the Leaderboard.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-2 md:pt-4 px-4">
              <Link to="/subscription" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 md:px-12 py-3 md:py-4 bg-gradient-to-r from-pink-600 to-purple-700 font-bold text-white rounded-xl md:rounded-lg flex items-center justify-center gap-2 md:gap-3 shadow-lg"
                >
                  <Zap size={18} /> GET SUPREME PASS
                </motion.button>
              </Link>
              <Link to="/leaderboard" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 md:px-12 py-3 md:py-4 border-2 border-white/20 bg-white/5 font-bold rounded-xl md:rounded-lg flex items-center justify-center gap-2 md:gap-3"
                >
                  <Trophy size={18} className="text-yellow-400" /> LEADERBOARD
                </motion.button>
              </Link>
            </div>
          </div>
        </div>

        {/* --- 2. WHATSAPP CHANNEL --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-12 md:mt-0 w-full bg-gradient-to-r from-green-900/30 via-black to-black border-y border-green-500/20 py-4 md:py-6"
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle size={20} md:size={28} className="text-black" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg md:text-xl font-bold uppercase">Official WhatsApp Hub</h2>
                <p className="text-green-400 text-xs font-bold uppercase flex items-center gap-2 justify-center sm:justify-start mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live ID/Pass & Schedules
                </p>
              </div>
            </div>
            <a 
              href="https://chat.whatsapp.com/YOUR_LINK" 
              target="_blank" 
              rel="noreferrer" 
              className="w-full sm:w-auto"
            >
              <button className="w-full px-6 md:px-10 py-2 md:py-3 bg-green-600 hover:bg-green-500 text-black font-bold uppercase rounded-lg flex items-center justify-center gap-2 md:gap-3 transition-all">
                Join Channel <ArrowRight size={16} />
              </button>
            </a>
          </div>
        </motion.div>

        {/* --- 3. PREMIUM FLASHCARDS --- */}
        <div className="py-12 md:py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 mb-3 md:mb-4 px-3 md:px-4 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full"
            >
              <Crown size={12} md:size={14} className="text-yellow-500" />
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Power Up Your Game</span>
            </motion.div>
            <h2 className="text-2xl md:text-5xl font-bold uppercase mb-2 md:mb-4">
              Elite <span className="text-pink-500">Passes</span>
            </h2>
            <p className="text-gray-500 text-sm">Swipe to select your warrior tier</p>
          </div>

          {/* Cards Container */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-8 md:pb-10 snap-x snap-mandatory hide-scrollbar px-2">
            
            {/* CARD 1: Scout */}
            <div className="min-w-[85vw] md:min-w-0 snap-center bg-gray-900/50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-800 flex flex-col">
              <Shield size={32} md:size={40} className="text-gray-500 mb-4 md:mb-6"/>
              <h3 className="text-xl md:text-2xl font-bold text-gray-300">SCOUT PASS</h3>
              <div className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4 md:mb-6">₹50 <span className="text-sm text-gray-500">/match</span></div>
              <ul className="text-sm text-gray-400 space-y-3 mb-6 md:mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Standard Support</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Manual Booking</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> 10 Loyalty Points</li>
              </ul>
              <Link to="/subscription" className="w-full py-3 md:py-4 border border-gray-700 text-center rounded-xl font-bold uppercase hover:bg-white hover:text-black transition-all">
                Select Tier
              </Link>
            </div>

            {/* CARD 2: GOD MODE */}
            <div className="min-w-[85vw] md:min-w-0 snap-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-xl"></div>
              <div className="relative h-full bg-gradient-to-b from-yellow-900/40 to-black p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 border-yellow-500/50 flex flex-col shadow-lg">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
                  Ultimate
                </div>
                <Crown size={40} md:size={48} className="text-yellow-400 mb-4 md:mb-6"/>
                <h3 className="text-2xl md:text-3xl font-bold text-yellow-300">GOD MODE</h3>
                <div className="text-4xl md:text-5xl font-bold text-white mt-2 mb-3 md:mb-4">₹199 <span className="text-base text-yellow-300/60">/week</span></div>
                <ul className="text-sm text-yellow-100/80 space-y-3 mb-6 md:mb-8 flex-1">
                  <li className="flex items-center gap-2"><Sparkles size={16} className="text-yellow-400"/> Direct Grand Final Entry</li>
                  <li className="flex items-center gap-2"><Gift size={16} className="text-yellow-400"/> Free Zyro Cap 🧢</li>
                  <li className="flex items-center gap-2"><Award size={16} className="text-yellow-400"/> Verified Badge</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-yellow-400"/> 30 Loyalty Points</li>
                </ul>
                <Link to="/subscription" className="w-full py-3 md:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-center rounded-xl font-bold uppercase hover:scale-105 transition-transform">
                  Claim God Mode
                </Link>
              </div>
            </div>

            {/* CARD 3: Warrior */}
            <div className="min-w-[85vw] md:min-w-0 snap-center bg-gray-900/50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-800 flex flex-col">
              <Flame size={32} md:size={40} className="text-pink-500 mb-4 md:mb-6"/>
              <h3 className="text-xl md:text-2xl font-bold text-white">WARRIOR</h3>
              <div className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4 md:mb-6">₹99 <span className="text-sm text-gray-500">/week</span></div>
              <ul className="text-sm text-gray-400 space-y-3 mb-6 md:mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-pink-500" /> Priority Slot Booking</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-pink-500" /> Live Stream Shoutout</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-pink-500" /> 20 Loyalty Points</li>
              </ul>
              <Link to="/subscription" className="w-full py-3 md:py-4 border border-pink-500/40 text-pink-500 text-center rounded-xl font-bold uppercase hover:bg-pink-500 hover:text-white transition-all">
                Select Tier
              </Link>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2 md:hidden animate-pulse">Swipe to explore →</p>
        </div>

        {/* --- 4. DATA TICKER --- */}
        <div className="bg-black/50 border-y border-gray-800 py-3 md:py-4 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center px-4 md:px-8">
                <div className="flex items-center mx-2 md:mx-4">
                  <TrendingUp size={12} className="text-pink-500 mr-2" />
                  <span className="text-xs text-gray-500 uppercase">50K+ Matches</span>
                </div>
                <div className="flex items-center mx-2 md:mx-4">
                  <Users size={12} className="text-pink-500 mr-2" />
                  <span className="text-xs text-gray-500 uppercase">10K+ Warriors</span>
                </div>
                <div className="flex items-center mx-2 md:mx-4">
                  <Star size={12} className="text-pink-500 mr-2" />
                  <span className="text-xs text-gray-500 uppercase">AI Rankings</span>
                </div>
                <div className="flex items-center mx-2 md:mx-4">
                  <Shield size={12} className="text-pink-500 mr-2" />
                  <span className="text-xs text-gray-500 uppercase">Instant Payouts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 5. PERMANENT BOTTOM NAVIGATION --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-gray-800 md:hidden">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${location.pathname === item.path 
                ? 'text-pink-500' 
                : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className={`p-2 rounded-lg ${location.pathname === item.path ? 'bg-pink-500/20' : ''}`}>
                {item.icon}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .animate-gradient {
          background-size: 200% auto;
          background-image: linear-gradient(to right, #ec4899, #ffffff, #a855f7, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          animation: gradient 3s linear infinite;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;