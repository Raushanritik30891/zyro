import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Crown, LogIn, UserCircle, Headset, Swords, Trophy, 
  Zap, ChevronRight, Bell, LogOut, Wallet, Home, 
  MessageSquare, Phone, Mail, HelpCircle, Info, ShieldCheck,
  Sparkles, Users, Award, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import logoImg from '../assets/logo.png'; 

// 👑 ADMIN LIST
const ADMIN_EMAILS = ["ritikraushan@gmail.com", "admin@zyroesports.com"]; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const supportMenuRef = useRef(null);

  // --- 🔥 AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) setUserData(snap.data());
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (supportMenuRef.current && !supportMenuRef.current.contains(event.target)) {
        setShowSupportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowUserMenu(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menu Config
  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={16} /> },
    { name: 'Matches', path: '/matches', icon: <Swords size={16} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={16} /> },
    { name: 'Passes', path: '/subscription', icon: <Crown size={16} /> },
    { name: 'Contact', path: '/contact', icon: <MessageSquare size={16} /> },
    { name: 'About', path: '/about', icon: <Info size={16} /> },
  ];

  // Support menu items
  const supportMenuItems = [
    { name: 'Live Chat', icon: <MessageSquare size={16} />, description: '24/7 Support', color: 'text-green-400', path: '/contact?type=chat' },
    { name: 'Call Support', icon: <Phone size={16} />, description: '+91 98765 43210', color: 'text-blue-400', path: '/contact?type=call' },
    { name: 'Email', icon: <Mail size={16} />, description: 'support@zyroesports.com', color: 'text-rosePink', path: '/contact?type=email' },
    { name: 'FAQ', icon: <HelpCircle size={16} />, description: 'Common Questions', color: 'text-yellow-400', path: '/about#faq' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'py-2 bg-black/95 backdrop-blur-xl border-b border-rosePink/30 shadow-[0_0_30px_rgba(0,0,0,0.5)]' 
          : 'py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* BRAND (Logo Always Visible) */}
          <Link to="/" className="flex items-center gap-3 z-50 group">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              {/* Glowing effect behind logo */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity 
                }}
                className="absolute inset-0 bg-rosePink/30 blur-xl rounded-full"
              />
              <img 
                src={logoImg} 
                alt="Zyro" 
                className="relative h-9 w-9 md:h-11 md:w-11 object-contain drop-shadow-[0_0_15px_#f43f5e] block"
                onError={(e) => {
                  e.target.style.display = 'block';
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f43f5e"/><text x="50" y="60" font-size="40" text-anchor="middle" fill="white" font-family="Arial">Z</text></svg>';
                }} 
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-gaming font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rosePink via-white to-purple-500 group-hover:from-white group-hover:to-rosePink transition-all duration-300">
                ZYRO
              </span>
              <span className="text-[8px] md:text-[10px] font-gaming text-rosePink/70 tracking-[0.2em] uppercase hidden sm:block">
                BLACK GOKU EDITION
              </span>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-1 backdrop-blur-sm bg-black/30 px-4 py-2 rounded-2xl border border-white/10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.name} 
                  to={item.path}
                  className="group relative px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={`transition-all duration-300 ${isActive ? 'text-rosePink' : 'text-gray-400 group-hover:text-rosePink'}`}>
                      {item.icon}
                    </span>
                    <span className={`font-gaming text-sm tracking-wider transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                      {item.name}
                    </span>
                  </div>
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rosePink to-purple-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            
            {/* Notification Bell */}
            {currentUser && (
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                className="hidden md:flex relative p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors group"
                title="Notifications"
              >
                <Bell size={20} className="text-gray-400 group-hover:text-yellow-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-rosePink rounded-full border-2 border-black animate-pulse"></div>
              </motion.button>
            )}

            {/* Support Menu (Desktop) */}
            <div className="hidden md:block relative" ref={supportMenuRef}>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSupportMenu(!showSupportMenu)}
                className="p-2.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full hover:from-blue-500/20 hover:to-cyan-500/20 transition-all border border-blue-500/20 group"
                title="Support"
              >
                <Headset size={20} className="text-blue-400 group-hover:text-cyan-300" />
              </motion.button>
              
              <AnimatePresence>
                {showSupportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.7)] backdrop-blur-xl overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Headset size={18} className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-gaming text-white text-sm">24/7 SUPPORT</h3>
                          <p className="text-xs text-gray-400">We're here to help</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Support Items */}
                    <div className="p-2 space-y-1">
                      {supportMenuItems.map((item, index) => (
                        <motion.button
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                          onClick={() => {
                            navigate(item.path);
                            setShowSupportMenu(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                        >
                          <div className={`p-1.5 rounded-lg bg-white/5 ${item.color}`}>
                            {item.icon}
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium text-white text-xs">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.description}</div>
                          </div>
                          <ChevronRight size={14} className="text-gray-500 group-hover:text-white" />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 🔥 GET PASS BUTTON (Always Visible) - DESKTOP */}
            <Link to="/subscription" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-gaming font-black text-sm uppercase rounded-xl shadow-[0_0_25px_rgba(234,179,8,0.4)] hover:shadow-[0_0_35px_rgba(234,179,8,0.6)] transition-all relative overflow-hidden group">
              <motion.div 
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <Crown size={16} fill="black" className="relative z-10 group-hover:rotate-12 transition-transform"/> 
              <span className="relative z-10">GET PASS</span>
              <Sparkles size={12} className="relative z-10 text-yellow-700 ml-1" />
            </Link>

            {/* User Logic */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 bg-gradient-to-r from-purple-900/30 to-rosePink/30 rounded-full border border-white/10 hover:border-rosePink/50 transition-all group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rosePink to-purple-600 flex items-center justify-center">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          className="w-full h-full rounded-full object-cover border-2 border-white/20" 
                          alt="Avatar" 
                        />
                      ) : (
                        <UserCircle size={18} className="text-white" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                  </div>
                  
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-gaming text-white">{currentUser.displayName?.split(' ')[0] || 'Player'}</div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      {userData?.isPremium ? (
                        <>
                          <Crown size={8} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400">Premium</span>
                        </>
                      ) : (
                        <span>Free Player</span>
                      )}
                    </div>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 10 }} 
                      className="absolute top-full right-0 mt-3 w-64 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="px-3 py-4 mb-2 border-b border-white/5 bg-gradient-to-r from-rosePink/10 to-purple-600/10">
                        <p className="text-sm font-bold text-white">{currentUser.displayName || 'Zyro Player'}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-gray-300">
                            {userData?.isPremium ? '👑 Premium Warrior' : '🛡️ Free User'}
                          </p>
                          <div className="text-xs font-gaming text-yellow-400">₹{userData?.wallet || '0'}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Link to="/profile" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all text-sm font-medium text-gray-300">
                          <UserCircle size={16} className="text-blue-400" /> PROFILE
                        </Link>
                        
                        <Link to="/wallet" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all text-sm font-medium text-gray-300">
                          <Wallet size={16} className="text-green-400" /> WALLET
                        </Link>
                        
                        {userData?.isPremium ? (
                          <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 p-3 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-xl transition-all text-sm font-medium text-yellow-400">
                            <Award size={16} className="text-yellow-400" /> DASHBOARD
                          </Link>
                        ) : (
                          <Link to="/subscription" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-xl transition-all text-sm font-medium text-yellow-400">
                            <Crown size={16} className="text-yellow-400" /> UPGRADE TO PREMIUM
                          </Link>
                        )}

                        {ADMIN_EMAILS.includes(currentUser.email) && (
                          <Link to="/admin" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 p-3 bg-rosePink/10 hover:bg-rosePink/20 rounded-xl transition-all text-sm font-bold text-rosePink">
                            <ShieldCheck size={16} /> ADMIN CONSOLE
                          </Link>
                        )}
                        
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-all text-sm font-bold mt-2">
                          <LogOut size={16} /> LOGOUT
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Login Button - Desktop
              <Link to="/login" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rosePink/20 to-purple-600/20 border border-rosePink/30 text-white hover:bg-gradient-to-r hover:from-rosePink hover:to-purple-600 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] group">
                <LogIn size={18} className="group-hover:rotate-12 transition-transform" /> 
                <span className="font-gaming tracking-wider text-sm">LOGIN</span>
              </Link>
            )}

            {/* MOBILE TOGGLE AND GET PASS */}
            <div className="md:hidden flex items-center gap-3">
              {/* Support Icon - Mobile */}
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSupportMenu(true)}
                className="p-2.5 bg-blue-500/10 rounded-full border border-blue-500/20"
              >
                <Headset size={20} className="text-blue-400" />
              </motion.button>

              {/* Get Pass Icon - Mobile */}
              <Link to="/subscription" className="relative group">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                >
                  <Crown size={20} fill="black" className="text-black" />
                </motion.button>
              </Link>

              <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
                {isOpen ? <X size={24} className="text-rosePink" /> : <Menu size={24} className="text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Animated Border Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rosePink/50 to-transparent"></div>
      </nav>

      {/* MOBILE OVERLAY MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-gradient-to-br from-black via-gray-900 to-black pt-28 px-6 md:hidden flex flex-col gap-2"
          >
            {/* Background Effects */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-rosePink/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-600/10 to-transparent"></div>
            
            {/* User Status Bar */}
            {currentUser ? (
              <div className="relative mb-6 p-4 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rosePink to-purple-600 flex items-center justify-center">
                        {currentUser.photoURL ? (
                          <img 
                            src={currentUser.photoURL} 
                            className="w-full h-full rounded-full object-cover border-2 border-white/20" 
                            alt="Avatar" 
                          />
                        ) : (
                          <UserCircle size={24} className="text-white" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div>
                      <h3 className="font-gaming text-white text-lg">{currentUser.displayName?.split(' ')[0] || 'Player'}</h3>
                      <div className="flex items-center gap-2">
                        {userData?.isPremium ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
                            <Crown size={12} className="text-yellow-400" />
                            <span className="text-xs text-yellow-400 font-gaming">PREMIUM</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Free Player</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <LogOut size={20} className="text-rosePink" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative mb-6 p-4 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <UserCircle size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-gaming text-white text-lg">GUEST PLAYER</h3>
                      <p className="text-sm text-gray-400">Login to unlock features</p>
                    </div>
                  </div>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-rosePink to-purple-600 rounded-xl font-gaming text-sm text-white"
                    >
                      LOGIN
                    </motion.button>
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm rounded-2xl border border-white/10 hover:border-rosePink/30 group active:scale-95 transition-all mb-2"
                >
                  <div className="p-2 bg-gradient-to-br from-rosePink/20 to-purple-600/20 rounded-xl group-hover:from-rosePink group-hover:to-purple-600 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-lg font-gaming font-bold text-white flex-1">{item.name}</span>
                  <ChevronRight size={20} className="text-gray-500 group-hover:text-rosePink transition-colors" />
                </Link>
              </motion.div>
            ))}

            {/* Get Pass Button (Mobile) - Only show if not premium */}
            {currentUser && !userData?.isPremium && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative mb-4 overflow-hidden rounded-2xl mt-4"
              >
                <Link to="/subscription" onClick={() => setIsOpen(false)}>
                  <button className="relative w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-gaming font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                    <span className="flex items-center justify-center gap-3">
                      <Crown size={20} fill="currentColor" />
                      GET PREMIUM PASS
                      <Sparkles size={16} />
                    </span>
                  </button>
                </Link>
              </motion.div>
            )}

            {/* Dashboard Button (if logged in and has pass) */}
            {currentUser && userData?.isPremium && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative mb-4"
              >
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-rosePink text-white font-gaming font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                    <span className="flex items-center justify-center gap-3">
                      <Award size={20} />
                      GO TO DASHBOARD
                      <ChevronRight size={20} />
                    </span>
                  </button>
                </Link>
              </motion.div>
            )}

            {/* Admin Access Button */}
            {currentUser && ADMIN_EMAILS.includes(currentUser.email) && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="relative mb-4"
              >
                <Link to="/admin" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-4 bg-gradient-to-r from-rosePink to-purple-600 text-white font-gaming font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                    <span className="flex items-center justify-center gap-3">
                      <ShieldCheck size={20} />
                      ADMIN CONSOLE
                      <ChevronRight size={20} />
                    </span>
                  </button>
                </Link>
              </motion.div>
            )}

            {/* Footer */}
            <div className="mt-auto mb-8 text-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>
              <p className="text-rosePink text-xs font-gaming tracking-widest mb-2">ZYRO ESPORTS</p>
              <p className="text-gray-500 text-xs">BLACK GOKU EDITION • V2.0</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Support Menu Modal */}
      <AnimatePresence>
        {showSupportMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl md:hidden flex flex-col p-6"
            onClick={() => setShowSupportMenu(false)}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-gaming text-white">SUPPORT</h2>
              <button onClick={() => setShowSupportMenu(false)}>
                <X size={30} className="text-rosePink" />
              </button>
            </div>
            
            <div className="space-y-4">
              {supportMenuItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm rounded-2xl border border-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                    setShowSupportMenu(false);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;