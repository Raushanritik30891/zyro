import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Crown, Zap, MessageCircle, Star, Shield, Trophy, Sparkles, 
  ArrowRight, Flame, Target, Users, TrendingUp, Gift, CheckCircle, Award, Calendar, Newspaper
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Lazy load the chatbot for better performance
const AIChatbot = lazy(() => import('../components/AIChatbot'));

// Assets
import blackGokuImg from '../assets/goku.png';

// Firebase imports
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';

// Loading fallback for lazy components
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
  </div>
);

const Home = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const location = useLocation();
  const [tickers, setTickers] = useState([]); 
  const [loadingTickers, setLoadingTickers] = useState(true);
  
  // Floating animation for elements
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

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);
  // ✅ Fetch ticker data (REAL-TIME UPDATES)
  useEffect(() => {
    setLoadingTickers(true);
    
    // onSnapshot real-time listener lagaya hai
    const unsub = onSnapshot(doc(db, "settings", "ticker"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTickers(data.messages || []);
      } else {
        // Agar database me ticker nahi hai to default dikhao
        setTickers([
          "🔥 NEW: AI-Powered Match Analysis Available!"
        ]);
      }
      setLoadingTickers(false);
    }, (error) => {
      console.error("Error fetching tickers:", error);
      setLoadingTickers(false);
    });

    // Cleanup subscription
    return () => unsub();
  }, []);

  // Fetch latest blogs
  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const q = query(
          collection(db, "blogs"), 
          orderBy("timestamp", "desc"), 
          limit(3)
        );
        const snapshot = await getDocs(q);
        const blogData = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setBlogs(blogData);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchLatestBlogs();
  }, []);

  // Preload and lazy load images
  useEffect(() => {
    const preloadImages = async () => {
      const images = [
        blackGokuImg,
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&w=400&q=80',
        'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?ixlib=rb-4.0.3&auto=format&w=400&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&w=400&q=80'
      ];

      const promises = images.map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(promises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesLoaded(true); // Still set to true even if some fail
      }
    };

    preloadImages();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Desktop Navbar */}
      <Navbar />
      
{/* Moving Ticker */}
      <div className="sticky top-16 z-40 bg-gradient-to-r from-black via-purple-900/30 to-black border-y border-purple-500/20 py-2 overflow-hidden">
        <div className="relative">
          <div className="flex animate-marquee whitespace-nowrap">
            {/* ✅ FIX: Yaha hum 'tickers' state use kar rahe hain */}
            {(tickers.length > 0 ? tickers : [
              "🔥 Welcome to Zyro Esports!", 
              "🎮 Loading Live Updates...", 
              "🏆 Join Daily Tournaments!"
            ]).map((text, idx) => (
              <div key={idx} className="inline-flex items-center mx-6">
                <div className={`w-2 h-2 rounded-full mr-3 animate-pulse ${
                  idx % 3 === 0 ? 'bg-pink-500' : 
                  idx % 3 === 1 ? 'bg-cyan-500' : 
                  'bg-yellow-500'
                }`}></div>
                <span className="text-white font-bold text-sm">{text}</span>
              </div>
            ))}
            
            {/* Duplicate for seamless loop (Same Fix Here) */}
            {(tickers.length > 0 ? tickers : [
              "🔥 Welcome to Zyro Esports!", 
              "🎮 Loading Live Updates...", 
              "🏆 Join Daily Tournaments!"
            ]).map((text, idx) => (
              <div key={`dup-${idx}`} className="inline-flex items-center mx-6">
                <div className={`w-2 h-2 rounded-full mr-3 animate-pulse ${
                  idx % 3 === 0 ? 'bg-pink-500' : 
                  idx % 3 === 1 ? 'bg-cyan-500' : 
                  'bg-yellow-500'
                }`}></div>
                <span className="text-white font-bold text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 md:pt-28 pb-24 md:pb-12">
        {/* Hero Section */}
        <div className="relative px-4 flex flex-col items-center justify-center text-center z-10 overflow-hidden">
          
          {/* Enhanced Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/30 to-black"></div>
            
            {/* Dynamic Color Splashes */}
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

            {/* Moving Particles */}
            {[...Array(15)].map((_, i) => (
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
                  'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                }`}
                style={{
                  top: `${40 + (i * 2)}%`,
                  left: `${30 + (i * 2)}%`
                }}
              />
            ))}
          </div>

          {/* Goku Image with Lazy Loading */}
          <motion.div 
            variants={floatingAnimation}
            animate="animate"
            className="relative z-10 mt-12 md:mt-20"
          >
            <div className="relative">
              {!imagesLoaded && (
                <div className="h-[250px] md:h-[500px] lg:h-[600px] w-[300px] md:w-[500px] lg:w-[600px] bg-gray-900 animate-pulse rounded-lg"></div>
              )}
              <motion.img 
                src={blackGokuImg} 
                alt="Black Goku" 
                className={`h-[250px] md:h-[500px] lg:h-[600px] w-auto object-contain transition-opacity duration-500 ${
                  imagesLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                onLoad={() => setImagesLoaded(true)}
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
            </div>
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

        {/* WhatsApp Channel */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-12 md:mt-0 w-full bg-gradient-to-r from-green-900/30 via-black to-black border-y border-green-500/20 py-4 md:py-6"
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle size={20} className="text-black md:size-6" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg md:text-xl font-bold uppercase">Official WhatsApp Hub</h2>
                <p className="text-green-400 text-xs font-bold uppercase flex items-center gap-2 justify-center sm:justify-start mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Daily TOURNAMENTS AND UPDATES
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

        {/* Premium Flashcards */}
        <div className="py-12 md:py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 mb-3 md:mb-4 px-3 md:px-4 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full"
            >
              <Crown size={12} className="text-yellow-500 md:size-4" />
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
              <Shield size={32} className="text-gray-500 mb-4 md:mb-6 md:size-10"/>
              <h3 className="text-xl md:text-2xl font-bold text-gray-300">GOLD PASS</h3>
              <div className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4 md:mb-6">₹99 <span className="text-sm text-gray-500">/WEEK</span></div>
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
                <Crown size={40} className="text-yellow-400 mb-4 md:mb-6 md:size-12"/>
                <h3 className="text-2xl md:text-3xl font-bold text-yellow-300">GOD MODE</h3>
                <div className="text-4xl md:text-5xl font-bold text-white mt-2 mb-3 md:mb-4">₹299 <span className="text-base text-yellow-300/60">/week</span></div>
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
              <Flame size={32} className="text-pink-500 mb-4 md:mb-6 md:size-10"/>
              <h3 className="text-xl md:text-2xl font-bold text-white">DIAMOND</h3>
              <div className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4 md:mb-6">₹199 <span className="text-sm text-gray-500">/week</span></div>
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

        {/* Latest Blogs Section */}
        <div className="py-12 md:py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-5xl font-bold uppercase mb-4">
              Latest <span className="text-cyan-500">News</span> & Updates
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
              Stay updated with the latest tournaments, tips, and community highlights
            </p>
          </div>

          {loadingBlogs ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              <p className="text-gray-500 mt-4">Loading latest news...</p>
            </div>
          ) : blogs.length > 0 ? (
            <>
              {/* Blog Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogs.map((post) => (
                  <LazyBlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center mt-10">
                <Link 
                  to="/blogs" 
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-cyan-500/30 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500 hover:text-black transition-all"
                >
                  <Sparkles size={18} />
                  View All Blog Posts
                  <ArrowRight size={18} />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-gray-800">
              <Newspaper size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Lazy Loaded AI Chatbot with Suspense */}
      <Suspense fallback={<LoadingFallback />}>
        <AIChatbot />
      </Suspense>

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
          animation: marquee 10s linear infinite;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

// Lazy Blog Card Component for better performance
const LazyBlogCard = React.memo(({ post }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all group hover:-translate-y-1">
      {/* Blog Image with lazy loading */}
      <div className="h-48 overflow-hidden bg-gray-900 relative">
        {post.image ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
            )}
            <img 
              src={post.image} 
              alt={post.title} 
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover group-hover:scale-110 transition duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <Newspaper size={48} className="text-cyan-500/50" />
          </div>
        )}
        <div className="absolute top-4 left-4 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">
          {post.category || 'News'}
        </div>
      </div>
      
      {/* Blog Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={12} /> 
            {post.timestamp ? new Date(post.timestamp.seconds * 1000).toLocaleDateString() : 'Today'}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {post.content}
        </p>
        
        <Link 
          to={`/blog/${post.id}`} 
          className="text-cyan-400 hover:text-white text-sm font-bold flex items-center gap-1"
        >
          Read More <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
});

LazyBlogCard.displayName = 'LazyBlogCard';

export default Home;