import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Crown, LogIn, UserCircle, Headset, Swords, Trophy, 
  LogOut, Home, Info, ShieldCheck, User, Zap, Gamepad2,
  Sparkles, Award, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import logoImg from '../assets/logo.png'; 

// 👑 ADMIN LIST
const ADMIN_EMAILS = ["raushanritik30891@gmail.com", "hrithiraushan@gmail.com", "admin@zyro.com"];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // --- 🔥 AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) setUserData(snap.data());
        } catch (e) { console.error("User data fetch error", e); }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
    });
    return () => unsubscribe();
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
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Matches', path: '/matches', icon: <Swords size={18} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={18} /> },
    { name: 'Passes', path: '/subscription', icon: <Crown size={18} /> },
  ];

  return (
    <>
      {/* --- NAVBAR CONTAINER (High Z-Index) --- */}
      <nav className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 ${scrolled ? 'py-2 bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'py-3 bg-gradient-to-b from-black/90 to-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* --- 1. LOGO BRANDING (Always Visible on ALL Screens) --- */}
          <Link to="/" className="flex items-center gap-3 z-[1000] shrink-0 min-w-[140px]">
            {/* Logo Container - REMOVED RECTANGLE, JUST LOGO */}
            <div className="relative">
              {/* Glow Effect - Made larger */}
               <div className="absolute -inset-3 bg-rosePink/20 blur-lg rounded-full opacity-70"></div>
              {/* Logo Image - Made larger, no background rectangle */}
              <div className="relative w-20 h-12 md:w-20 md:h-20">
                <img 
                  src={logoImg} 
                  alt="Zyro Logo" 
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(244,63,94,0.7)]" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback Text Logo - removed rectangle background */}
                <div className="hidden items-center justify-center w-full h-full">
                  <span className="font-gaming font-black text-white text-3xl">Z</span>
                </div>
              </div>
            </div>
            
            {/* Text Branding - ALWAYS VISIBLE */}
            <div className="flex flex-col justify-center">
              <span className="text-xl md:text-2xl font-gaming font-black italic tracking-wider text-white leading-none bg-gradient-to-r from-rosePink via-white to-purple-500 bg-clip-text text-transparent">
                ZYRO
              </span>
              <span className="text-[10px] font-bold text-rosePink tracking-[0.2em] uppercase leading-tight hidden sm:block">
                ESPORTS
              </span>
            </div>
          </Link>

          {/* --- 2. DESKTOP CENTER MENU (Hidden on Mobile) --- */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 px-3 py-2 rounded-2xl border border-white/10 backdrop-blur-sm">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${location.pathname === item.path ? 'bg-rosePink text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {item.icon} {item.name}
              </Link>
            ))}
            <Link to="/contact" className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
              <Headset size={16}/> Support
            </Link>
            <Link to="/about" className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
              <Info size={16}/> About
            </Link>
          </div>

          {/* --- 3. RIGHT ACTIONS SECTION (Mobile & Desktop) --- */}
          <div className="flex items-center gap-3 md:gap-4 z-[1000]">
            
            {/* GET PASS BUTTON - ALWAYS VISIBLE */}
            <Link to="/subscription" className="relative group">
              {/* Desktop: Full Button with Glow */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-gaming font-black text-xs uppercase rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-105 transition-all duration-300">
                <Crown size={14} fill="black" className="group-hover:rotate-12 transition-transform"/> 
                <span>GET PASS</span>
                <Sparkles size={12} className="text-yellow-700"/>
              </div>
              
              {/* Mobile: Icon with Glow */}
              <div className="md:hidden relative">
                <div className="absolute inset-0 bg-yellow-500 blur rounded-full animate-pulse"></div>
                <div className="relative p-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                  <Crown size={14} fill="black"/>
                </div>
              </div>
            </Link>

            {/* USER / LOGIN SECTION */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)} 
                  className="flex items-center gap-2 pl-1 pr-2 md:pr-3 py-1 bg-gradient-to-r from-purple-900/20 to-rosePink/20 rounded-xl border border-white/10 hover:border-rosePink/50 transition-all group"
                >
                  {/* User Avatar */}
                  <div className="relative">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-rosePink to-purple-600 flex items-center justify-center overflow-hidden border-2 border-white/20 group-hover:border-rosePink/50">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          className="w-full h-full object-cover" 
                          alt="User" 
                        />
                      ) : (
                        <User size={16} className="text-white"/>
                      )}
                    </div>
                    {/* Online Status */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                  </div>
                  
                  {/* User Name - Hidden on very small screens */}
                  <div className="hidden sm:block text-left min-w-[60px]">
                    <p className="text-xs font-gaming font-bold text-white truncate">
                      {currentUser.displayName?.split(' ')[0] || 'Player'}
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      {userData?.isPremium ? (
                        <>
                          <Crown size={8} className="text-yellow-400 fill-yellow-400"/>
                          <span className="text-yellow-400">Premium</span>
                        </>
                      ) : (
                        <span>Free</span>
                      )}
                    </p>
                  </div>
                </button>
                
                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="absolute top-full right-0 mt-3 w-64 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl p-3 z-50 overflow-hidden"
                    >
                      {/* User Header */}
                      <div className="px-3 py-4 mb-2 border-b border-white/10 bg-gradient-to-r from-rosePink/10 to-purple-600/10 rounded-xl">
                        <p className="text-sm font-gaming font-bold text-white truncate">
                          {currentUser.displayName || 'Zyro Player'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            {userData?.isPremium ? (
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
                                <Crown size={10} className="text-yellow-400"/>
                                <span className="text-[10px] text-yellow-400 font-bold">PREMIUM</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/20 rounded-full">
                                <span className="text-[10px] text-gray-400 font-bold">FREE USER</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="space-y-1">
                        <Link 
                          to="/profile" 
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all text-sm font-medium text-gray-300"
                        >
                          <UserCircle size={16} className="text-blue-400"/> 
                          PROFILE
                        </Link>
                        
                        <Link 
                          to="/matches" 
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all text-sm font-medium text-gray-300"
                        >
                          <Gamepad2 size={16} className="text-green-400"/> 
                          MATCHES
                        </Link>
                        
                        {/* Admin Access - Only for Admins */}
                        {ADMIN_EMAILS.includes(currentUser.email) && (
                          <Link 
                            to="/admin" 
                            onClick={() => setShowUserMenu(false)}
                            className="w-full flex items-center gap-3 p-3 bg-rosePink/10 hover:bg-rosePink/20 rounded-xl transition-all text-sm font-bold text-rosePink"
                          >
                            <ShieldCheck size={16}/> 
                            ADMIN PANEL
                          </Link>
                        )}
                        
                        {/* Upgrade Button if not Premium */}
                        {!userData?.isPremium && (
                          <Link 
                            to="/subscription" 
                            onClick={() => setShowUserMenu(false)}
                            className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-xl transition-all text-sm font-bold text-yellow-400 mt-2"
                          >
                            <Crown size={16} className="text-yellow-400"/> 
                            UPGRADE TO PREMIUM
                          </Link>
                        )}
                        
                        {/* Logout Button */}
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-all text-sm font-bold mt-1"
                        >
                          <LogOut size={16}/> 
                          LOGOUT
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // LOGIN BUTTON - ALWAYS VISIBLE WHEN NOT LOGGED IN
              <Link 
                to="/login" 
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rosePink to-purple-600 text-white rounded-xl font-gaming font-bold text-xs uppercase shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] hover:scale-105 transition-all"
              >
                <LogIn size={14} className="group-hover:rotate-12 transition-transform"/> 
                <span>LOGIN</span>
              </Link>
            )}

            {/* MOBILE HAMBURGER MENU TOGGLE */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="lg:hidden ml-1 p-2 rounded-lg bg-white/5 border border-white/10 hover:border-rosePink/50 transition-colors"
            >
              {isOpen ? (
                <X size={24} className="text-rosePink"/>
              ) : (
                <Menu size={24} className="text-white"/>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* --- 📱 MOBILE BOTTOM NAVIGATION BAR (Fixed - Only on Mobile) --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-xl border-t border-white/10 pb-safe z-[1000] md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          
          {/* 1. HOME */}
          <Link to="/" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/' ? 'text-rosePink' : 'text-gray-500'}`}>
            <Home size={20} className={location.pathname === '/' ? 'fill-rosePink/20' : ''} />
            <span className="text-[9px] font-bold mt-1 uppercase">Home</span>
          </Link>

          {/* 2. MATCHES */}
          <Link to="/matches" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/matches' ? 'text-rosePink' : 'text-gray-500'}`}>
            <Swords size={20} />
            <span className="text-[9px] font-bold mt-1 uppercase">Matches</span>
          </Link>

          {/* 3. CENTER BUTTON (GET PASS / ADMIN) */}
          <div className="relative -top-5">
            <Link to="/subscription" className="w-14 h-14 bg-gradient-to-tr from-rosePink to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.6)] border-4 border-black">
              <Crown size={24} className="text-white fill-white animate-pulse" />
            </Link>
          </div>

          {/* 4. LEADERBOARD */}
          <Link to="/leaderboard" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/leaderboard' ? 'text-rosePink' : 'text-gray-500'}`}>
            <Trophy size={20} />
            <span className="text-[9px] font-bold mt-1 uppercase">Rank</span>
          </Link>

          {/* 5. PROFILE / LOGIN */}
          {currentUser ? (
            <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/profile' ? 'text-rosePink' : 'text-gray-500'}`}>
              <div className={`w-6 h-6 rounded-full border ${location.pathname === '/profile' ? 'border-rosePink' : 'border-gray-500'} overflow-hidden`}>
                <img src={currentUser.photoURL || "https://api.dicebear.com/7.x/avataaars/svg"} alt="Me" className="w-full h-full object-cover"/>
              </div>
              <span className="text-[9px] font-bold mt-1 uppercase">Profile</span>
            </Link>
          ) : (
            <Link to="/login" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/login' ? 'text-rosePink' : 'text-gray-500'}`}>
              <LogIn size={20} />
              <span className="text-[9px] font-bold mt-1 uppercase">Login</span>
            </Link>
          )}

        </div>
      </div>

      {/* --- ADD BOTTOM PADDING TO BODY TO PREVENT OVERLAP --- */}
      <style>{`
        @media (max-width: 768px) {
          body { padding-bottom: 80px; } 
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>

      {/* --- MOBILE FULLSCREEN MENU --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[990] bg-gradient-to-br from-black via-gray-900 to-black pt-32 px-6 lg:hidden flex flex-col gap-3"
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
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rosePink to-purple-600 flex items-center justify-center overflow-hidden border-2 border-white/20">
                        {currentUser.photoURL ? (
                          <img 
                            src={currentUser.photoURL} 
                            className="w-full h-full object-cover" 
                            alt="User" 
                          />
                        ) : (
                          <User size={24} className="text-white" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div>
                      <h3 className="font-gaming text-white text-lg">
                        {currentUser.displayName?.split(' ')[0] || 'Player'}
                      </h3>
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
                    <button className="px-4 py-2 bg-gradient-to-r from-rosePink to-purple-600 rounded-xl font-gaming text-sm text-white">
                      LOGIN
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {[...navItems, 
              { name: 'Support', path: '/contact', icon: <Headset size={18} /> },
              { name: 'About Us', path: '/about', icon: <Info size={18} /> }
            ].map((item, index) => (
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
                  <Zap size={20} className="text-gray-500 group-hover:text-rosePink transition-colors" />
                </Link>
              </motion.div>
            ))}

            {/* Get Pass Button (Mobile) */}
            {currentUser && !userData?.isPremium && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative mb-4 overflow-hidden rounded-2xl mt-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-xl"></div>
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
                      ADMIN PANEL
                      <Zap size={20} />
                    </span>
                  </button>
                </Link>
              </motion.div>
            )}

            {/* Footer */}
            <div className="mt-auto mb-8 text-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>
              <p className="text-rosePink text-xs font-gaming tracking-widest mb-2">ZYRO ESPORTS</p>
              <p className="text-gray-500 text-xs">BLACK GOKU EDITION • V3.0</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;