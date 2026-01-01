import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Crown, LogIn, UserCircle, Headset, Swords, Trophy, 
  Zap, ChevronRight, Bell, LogOut, Wallet, Home, 
  MessageSquare, Phone, Mail, HelpCircle, Info, ShieldCheck
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
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-2 bg-black/95 backdrop-blur-xl border-b border-white/10' : 'py-4 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* BRAND (Logo Always Visible) */}
          <Link to="/" className="flex items-center gap-3 z-50 group">
            <motion.div whileHover={{ rotate: 10 }} className="relative">
              <div className="absolute inset-0 bg-rosePink/30 blur-xl rounded-full animate-pulse" />
              <img src={logoImg} alt="Zyro" className="relative h-10 w-10 object-contain block" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-gaming font-black italic tracking-widest text-white">ZYRO</span>
              <span className="text-[8px] font-bold text-rosePink tracking-[0.2em] uppercase hidden sm:block">Black Goku Edition</span>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            {navItems.map((item) => (
              <Link key={item.name} to={item.path} className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${location.pathname === item.path ? 'bg-rosePink text-white' : 'text-gray-400 hover:text-white'}`}>
                {item.icon} {item.name}
              </Link>
            ))}
            <Link to="/contact" className="px-4 py-2 rounded-full text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2">
                <Headset size={16}/> Support
            </Link>
            <Link to="/about" className="px-4 py-2 rounded-full text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2">
                <Info size={16}/> About
            </Link>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            
            {/* 🔥 GET PASS BUTTON (Always Visible) */}
            <Link to="/subscription" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-black text-xs uppercase rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:scale-105 transition-all">
                <Crown size={14} fill="black"/> Get Pass
            </Link>

            {/* Mobile Pass Icon */}
            <Link to="/subscription" className="sm:hidden p-2 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20">
                <Crown size={20}/>
            </Link>

            {/* User Logic */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white/5 rounded-full border border-white/10 hover:border-rosePink/50 transition-all">
                  <img src={currentUser.photoURL} className="w-8 h-8 rounded-full border border-rosePink" alt="Avatar" />
                  <span className="hidden md:block text-[10px] font-black text-white uppercase">{currentUser.displayName?.split(' ')[0]}</span>
                </button>
                
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 mt-3 w-56 bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden">
                      <div className="px-3 py-2 mb-2 border-b border-white/5">
                          <p className="text-xs font-bold text-white">{currentUser.displayName}</p>
                          <p className="text-[10px] text-gray-500">{userData?.isPremium ? '👑 Premium Warrior' : '🛡️ Free User'}</p>
                      </div>
                      <Link to="/profile" onClick={()=>setShowUserMenu(false)} className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all text-xs font-bold text-gray-300"><UserCircle size={16}/> PROFILE</Link>
                      
                      {ADMIN_EMAILS.includes(currentUser.email) && (
                        <Link to="/admin" onClick={()=>setShowUserMenu(false)} className="w-full flex items-center gap-3 p-3 hover:bg-rosePink/10 text-rosePink rounded-xl transition-all text-xs font-bold"><ShieldCheck size={16}/> ADMIN CONSOLE</Link>
                      )}
                      
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-all text-xs font-bold mt-1"><LogOut size={16}/> LOGOUT</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 bg-rosePink text-white rounded-full font-black text-xs uppercase shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:bg-white hover:text-black transition-all">
                Login
              </Link>
            )}

            {/* MOBILE TOGGLE */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-1">
                {isOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{type:'tween'}} className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden flex flex-col gap-2">
            
            {navItems.map((item) => (
              <Link key={item.name} to={item.path} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 border border-white/5 bg-white/5 rounded-2xl text-lg font-gaming font-bold text-white uppercase italic active:scale-95 transition-all">
                <span className="text-rosePink">{item.icon}</span> {item.name}
              </Link>
            ))}

            <div className="grid grid-cols-2 gap-2 mt-2">
                <Link to="/contact" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    <Headset size={24} className="text-blue-500"/> SUPPORT
                </Link>
                <Link to="/about" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    <Info size={24} className="text-green-500"/> ABOUT US
                </Link>
            </div>

            {currentUser && ADMIN_EMAILS.includes(currentUser.email) && (
               <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 p-4 mt-2 bg-rosePink/10 border border-rosePink/30 rounded-2xl text-rosePink font-black uppercase text-sm"><ShieldCheck size={18}/> Access Admin HQ</Link>
            )}

            <div className="mt-auto mb-8">
                <p className="text-center text-[10px] text-gray-600 font-mono">ZYRO ESPORTS • V2.0</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;