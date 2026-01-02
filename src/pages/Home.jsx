import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Crown, Zap, MessageCircle, Star, Shield, Trophy, 
  ArrowRight, Flame, Target, Users, TrendingUp, Sparkles, Gift, CheckCircle, Award
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AIChatbot from '../components/AIChatbot'; // ✅ AI Chatbot import karo
// Asset Check
import blackGokuImg from '../assets/goku.png';

const Home = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  
  const floatingAnimation = {
    animate: { 
      y: [0, -30, 0],
      transition: { 
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Mobile menu close when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Desktop Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="pt-16 md:pt-28 pb-24 md:pb-12">
        {/* --- 1. HERO SECTION (Black Goku Style) --- */}
        <div className="relative px-4 flex flex-col items-center justify-center text-center z-10 overflow-hidden">
          
          {/* 🔥 ENHANCED BACKGROUND WITH DYNAMIC COLOR SPLASHES 🔥 */}
          <div className="absolute inset-0">
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/30 to-black"></div>
            
            {/* Dynamic Color Splashes Around Image Area */}
            <motion.div 
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, 50, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity 
              }}
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-500/15 blur-[120px] rounded-full"
            />
            
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
                x: [0, -40, 0]
              }}
              transition={{ 
                duration: 7,
                repeat: Infinity,
                delay: 1
              }}
              className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-purple-500/15 blur-[110px] rounded-full"
            />

            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.4, 0.1],
                y: [0, 60, 0]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                delay: 2
              }}
              className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full"
            />

            {/* Moving Particles Around Image Area */}
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                animate={{
                  y: [0, -100, 0],
                  x: Math.sin(i * 0.5) * 80,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className={`absolute ${i % 3 === 0 ? 'w-[4px] h-[4px]' : 'w-[2px] h-[2px]'} rounded-full ${
                  i % 5 === 0 ? 'bg-pink-500 shadow-[0_0_15px_#ec4899]' : 
                  i % 5 === 1 ? 'bg-purple-500 shadow-[0_0_15px_#a855f7]' : 
                  i % 5 === 2 ? 'bg-blue-500 shadow-[0_0_12px_#3b82f6]' : 
                  i % 5 === 3 ? 'bg-white shadow-[0_0_10px_#ffffff]' : 
                  'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                }`}
                style={{
                  top: `${40 + (i * 2)}%`,
                  left: `${30 + (i * 2)}%`
                }}
              />
            ))}

            {/* Animated Wave Lines */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`wave-${i}`}
                animate={{
                  x: [0, 100, 0],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
                className="absolute w-[300px] h-[1px] bg-gradient-to-r from-transparent via-pink-500/40 to-transparent"
                style={{
                  top: `${55 + i * 5}%`,
                  left: `${20 + i * 5}%`,
                  transform: `rotate(${i * 5}deg)`
                }}
              />
            ))}

            {/* Energy Bursts */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`burst-${i}`}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.3, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
                className="absolute w-[200px] h-[200px] rounded-full border border-pink-500/30"
                style={{
                  top: '45%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>

          {/* 🔥 VISUAL ANCHOR (GOKU) - NO CIRCLE, JUST IMAGE WITH EFFECTS 🔥 */}
          <motion.div 
            variants={floatingAnimation}
            animate="animate"
            className="relative z-10 mt-12 md:mt-20"
          >
            {/* Image Container with Glow Effect */}
            <div className="relative">
              {/* Background Color Splashes Behind Image */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity 
                }}
                className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 blur-3xl"
              />
              
              {/* Goku Image - LARGE AND CENTERED */}
              <motion.img 
                src={blackGokuImg} 
                alt="Black Goku" 
                className="h-[250px] md:h-[500px] lg:h-[600px] w-auto object-contain"
                animate={{ 
                  filter: [
                    "drop-shadow(0 0 60px rgba(236, 72, 153, 0.7))",
                    "drop-shadow(0 0 80px rgba(168, 85, 247, 0.8))",
                    "drop-shadow(0 0 60px rgba(236, 72, 153, 0.7))"
                  ]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity 
                }}
              />
              
              {/* Floating Energy Particles Around Image */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`energy-${i}`}
                  animate={{
                    rotate: 360,
                    x: Math.cos(i) * 180,
                    y: Math.sin(i) * 180,
                    scale: [0.3, 1, 0.3]
                  }}
                  transition={{
                    rotate: { duration: 15 + i, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1.5, repeat: Infinity, delay: i * 0.1 }
                  }}
                  className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full ${
                    i % 3 === 0 ? 'bg-pink-500' : 
                    i % 3 === 1 ? 'bg-purple-500' : 
                    'bg-cyan-400'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* 🔥 MAIN CONTENT - DIRECTLY UNDER IMAGE 🔥 */}
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
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> DAily TOURNAMENTS AND UPDATES
                </p>
              </div>
            </div>
            <a 
              href="https://whatsapp.com/channel/0029Vb78Cm842DcmsSYTRE33" 
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
              Premium <span className="text-pink-500">Passes</span>
            </h2>
            <p className="text-gray-500 text-sm">Swipe to select your warrior tier</p>
          </div>

          {/* Cards Container */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-8 md:pb-10 snap-x snap-mandatory hide-scrollbar px-2">
            
            {/* CARD 1: Scout */}
            <div className="min-w-[85vw] md:min-w-0 snap-center bg-gray-900/50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-800 flex flex-col">
              <Shield size={32} md:size={40} className="text-gray-500 mb-4 md:mb-6"/>
              <h3 className="text-xl md:text-2xl font-bold text-gray-300">GOLD PASS</h3>
              <div className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4 md:mb-6">₹49 <span className="text-sm text-gray-500">/WEEk</span></div>
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
              <h3 className="text-xl md:text-2xl font-bold text-white">DIAMOND</h3>
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

      </div>
      {/* ✅ AI CHATBOT COMPONENT (Floating) */}
      <AIChatbot />

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