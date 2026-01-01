import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Chrome, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- FIREBASE IMPORTS ---
import { auth, googleProvider } from '../firebase'; 
import { signInWithPopup } from 'firebase/auth';
// 1. Import Hook

  const handleGoogleLogin = async () => {
    try {
      setError(""); 

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 1. Email ko lowercase aur trim karo (Space/Caps hatao)
      const userEmail = user.email ? user.email.toLowerCase().trim() : "";

      console.log("🔓 Checking Access Level for:", userEmail);

      // 2. Check if Email is in Admin List
      if (ADMIN_EMAILS.includes(userEmail)) {
        addNotification('info', `Welcome Commander ${user.displayName}. HQ Access Granted.`); // 🔥 Trigger
        navigate('/admin', { replace: true }); 
      } else {
        addNotification('success', `Identity Verified. Welcome back, ${user.displayName}!`); // 🔥 Trigger
        navigate('/profile', { replace: true });
      }

    } catch (err) {
      addNotification('error', "Authentication Failed. Please retry."); // 🔥 Error Trigger
    }
  };

// 👑 ADMIN LIST (Sab small letters mein likhna safe rehta hai)
const ADMIN_EMAILS = [
  "raushanritik30891@gmail.com", 
  "admin@zyro.com",
  "ritikraushan@gmail.com" // Backup email bhi daal diya
]; 

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  // --- 🚀 GOOGLE LOGIN WITH ROBUST ADMIN CHECK ---
  const handleGoogleLogin = async () => {
    try {
      setError(""); 
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // 1. Email ko lowercase aur trim karo (Space/Caps hatao)
      const userEmail = user.email ? user.email.toLowerCase().trim() : "";

      console.log("🔓 Checking Access Level for:", userEmail);
      
      // 2. Check if Email is in Admin List
      if (ADMIN_EMAILS.includes(userEmail)) {
        console.log("👑 ADMIN ACCESS GRANTED - Warping to HQ...");
        // Replace true use kiya taaki back button dabane pe wapas login pe na aaye
        navigate('/admin', { replace: true }); 
      } else {
        console.log("👤 PLAYER ACCESS GRANTED - Entering Lobby...");
        navigate('/profile', { replace: true });
      }
      
    } catch (err) {
      console.error("Auth Error:", err);
      setError("Access Denied. Neural Link Failed."); 
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Cinematic Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-black to-black opacity-80 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rosePink/10 blur-[120px] rounded-full animate-pulse"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Branding */}
        <div className="text-center mb-10">
            <h1 className="text-6xl font-gaming font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rosePink via-white to-purple-600">
              ZYRO
            </h1>
            <p className="text-gray-500 text-[10px] tracking-[0.5em] uppercase mt-2 font-bold animate-pulse">
                Black Goku Edition
            </p>
        </div>

        {/* --- FORM CARD --- */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel-dark p-8 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(244,63,94,0.15)] relative overflow-hidden"
        >
            {/* Top Glow Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rosePink to-transparent"></div>

            <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/5 rounded-full border border-white/5 shadow-inner">
                    <ShieldCheck size={32} className="text-rosePink" />
                </div>
            </div>

            <h2 className="text-xl font-gaming font-black text-center mb-2 uppercase italic">
                {isLogin ? "System Entry" : "Join The Legion"}
            </h2>
            <p className="text-center text-gray-500 text-xs mb-8">Secure authentication gateway</p>

            {/* 🔥 MAIN ACTION BUTTON */}
            <button 
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-white text-black font-gaming font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:bg-rosePink hover:text-white transition-all duration-300 mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)] group"
            >
                <Chrome size={22} className="group-hover:rotate-[360deg] transition-transform duration-700" /> 
                <span>{isLogin ? "Continue with Google" : "Start Journey"}</span>
            </button>

            {/* Error Feedback */}
            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center mb-6">
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{error}</p>
                </motion.div>
            )}

            {/* Disabled Manual Input (Aesthetic) */}
            <div className="relative group opacity-40 pointer-events-none select-none">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-500"/>
                </div>
                <input type="text" className="w-full bg-black/50 border border-white/10 text-gray-500 text-xs rounded-xl block pl-10 p-3.5" placeholder="Manual Entry Disabled" disabled />
            </div>

            {/* Toggle Switch */}
            <div className="mt-8 text-center">
                <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                    {isLogin ? "New to Zyro? Create ID" : "Already a Warrior? Login"} 
                </button>
            </div>

        </motion.div>

        {/* Footer Status */}
        <div className="mt-6 flex justify-center gap-4 opacity-40">
            <p className="text-[9px] font-gaming text-gray-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
            </p>
            <p className="text-[9px] font-gaming text-gray-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-rosePink rounded-full animate-pulse"></span> Secured
            </p>
        </div>

      </div>
    </div>
  );
};

export default Login;