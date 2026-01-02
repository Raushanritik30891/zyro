import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Chrome, ShieldCheck, Home, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- FIREBASE IMPORTS ---
import { auth, googleProvider } from '../firebase'; 
import { signInWithPopup } from 'firebase/auth';

// 👑 ADMIN LIST (Sab small letters mein likhna safe rehta hai)
const ADMIN_EMAILS = [
  "raushanritik30891@gmail.com", 
  "igod61516@gmail.com",
  "hrthikraushan@gmail.com" // Backup email bhi daal diya
]; 

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [showHomeButton, setShowHomeButton] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const navigate = useNavigate();

  // Timeout handler - agar 10 seconds mein login na ho to home button show karo
  useEffect(() => {
    const id = setTimeout(() => {
      setShowHomeButton(true);
    }, 10000); // 10 seconds

    setTimeoutId(id);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Reset timeout jab login successful ho
  const resetTimeout = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setShowHomeButton(false);
    }
  };

  // --- 🚀 GOOGLE LOGIN WITH ROBUST ADMIN CHECK ---
  const handleGoogleLogin = async () => {
    try {
      setError(""); 
      setIsLoading(true);
      resetTimeout();
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // 1. Email ko lowercase aur trim karo (Space/Caps hatao)
      const userEmail = user.email ? user.email.toLowerCase().trim() : "";

      console.log("🔓 Checking Access Level for:", userEmail);
      
      // 2. Check if Email is in Admin List
      if (ADMIN_EMAILS.includes(userEmail)) {
        console.log("👑 ADMIN ACCESS GRANTED - Warping to HQ...");
        // Small delay for better UX
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 500);
      } else {
        console.log("👤 PLAYER ACCESS GRANTED - Entering Lobby...");
        setTimeout(() => {
          navigate('/profile', { replace: true });
        }, 500);
      }
      
    } catch (err) {
      console.error("Auth Error:", err);
      
      // Specific error messages
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Login cancelled. Please try again.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Popup blocked! Please allow popups for this site.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Check your internet connection.");
      } else {
        setError("Access Denied. Neural Link Failed.");
      }
      
      setIsLoading(false);
      setShowHomeButton(true); // Show home button on error
    }
  };

  // Handle manual home navigation
  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  // Handle browser back button
  useEffect(() => {
    const handleBackButton = (e) => {
      e.preventDefault();
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handleBackButton);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate]);

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
                disabled={isLoading}
                className={`w-full py-4 ${isLoading ? 'bg-gray-700' : 'bg-white'} text-black font-gaming font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 ${!isLoading && 'hover:bg-rosePink hover:text-white'} transition-all duration-300 mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)] group`}
            >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Chrome size={22} className="group-hover:rotate-[360deg] transition-transform duration-700" /> 
                    <span>{isLogin ? "Continue with Google" : "Start Journey"}</span>
                  </>
                )}
            </button>

            {/* Error Feedback */}
            {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center mb-6"
                >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <AlertCircle size={14} className="text-red-500" />
                      <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{error}</p>
                    </div>
                    
                    {/* Troubleshooting Tips */}
                    {error.includes('Popup blocked') && (
                      <p className="text-[9px] text-gray-400 mt-1">
                        Allow popups from this site in browser settings
                      </p>
                    )}
                </motion.div>
            )}

            {/* Return to Home Button (Conditional) */}
            {(showHomeButton || error) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <button 
                  onClick={handleGoHome}
                  className="w-full py-3 bg-gray-900/50 border border-gray-700 text-gray-300 font-gaming text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:bg-gray-800 hover:text-white transition-all duration-300 group"
                >
                  <Home size={18} className="text-gray-500 group-hover:text-rosePink" /> 
                  <span>Return to Home</span>
                </button>
                <p className="text-[9px] text-gray-500 text-center mt-2">
                  Stuck? Go back to homepage
                </p>
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
            <p className="text-[9px] font-gaming text-gray-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> v2.0
            </p>
        </div>

        {/* Emergency Exit - Bottom Right Corner */}
        <div className="fixed bottom-4 right-4">
          <button 
            onClick={handleGoHome}
            className="p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-rosePink transition-all duration-300 group"
            title="Emergency Exit"
          >
            <Home size={16} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;