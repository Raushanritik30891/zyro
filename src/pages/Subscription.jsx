import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Upload, Loader, X, Copy, Check, ShieldCheck, Zap, Star, Clock, Gift, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore'; 
import { useNotification } from '../context/NotificationContext'; 

// ⚠️ CONFIG
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwhttjvop/image/upload"; 
const UPLOAD_PRESET = "zyro esports"; 

// QR Code image URL - ADD YOUR QR CODE IMAGE URL HERE
const QR_CODE_URL = "/qr.png"; // public folder के root में रखें qr.png

const Subscription = () => {
  const { addNotification } = useNotification();
  const [selectedPlan, setSelectedPlan] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const [formData, setFormData] = useState({ 
    fullName: "", 
    whatsappNo: "",
    transactionId: ""  // Added transaction ID field
  });

  const isFormValid = formData.fullName && formData.whatsappNo && formData.transactionId;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserData(snap.data());
          setFormData(prev => ({
            ...prev,
            fullName: snap.data().displayName || ""
          }));
        }
      }
    };
    fetchUserData();
  }, []);

  // --- 🔥 PLANS WITH NEW POINTS SYSTEM ---
  const basePlans = [
    { 
      id: "warrior", 
      name: "GOLD PASS", 
      price: 49, 
      points: 10, // ₹49 → 10 points
      color: "#60a5fa", 
      icon: <ShieldCheck size={32}/>,
      features: [
        "10 LOYALTY POINTS",
        "PERSONAL IN DM IDP FIRST",
        "FIRST SERVICE FOR TEAM",
        "IF THEY WANT TEAM OR PLAYERS WE WILL PROVIDE"
      ] 
    },
    { 
      id: "elite", 
      name: "DIAMOND PASS", 
      price: 99, 
      points: 20, // ₹99 → 20 points
      color: "#f43f5e", 
      icon: <Zap size={32}/>,
      features: [
        "20 LOYALTY POINTS",
        "PERSONAL IN DM IDP FIRST",
        "FIRST SERVICE FOR TEAM",
        "IF THEY WANT TEAM OR PLAYERS WE WILL PROVIDE",
        "TOURNAMENT SLOT WITHOUT REGISTRATION",
        "LIVE PE UNKI TEAM KO JYADA SHOW KIYA JAYEGA"
      ] 
    },
    { 
      id: "god", 
      name: "GOD PASS", 
      price: 199, 
      points: 50, // ₹199 → 50 points
      color: "#facc15", 
      featured: true,
      icon: <Crown size={32}/>,
      features: [
        "50 LOYALTY POINTS",
        "PERSONAL IN DM IDP FIRST",
        "FIRST SERVICE FOR TEAM",
        "IF THEY WANT TEAM OR PLAYERS WE WILL PROVIDE",
        "TOURNAMENT SLOT WITHOUT REGISTRATION",
        "LIVE PE UNKI TEAM KO JYADA SHOW KIYA JAYEGA",
        "GET FREE CAPS OF ZYRO ESPORTS",
        "FREE ENTRY IN ZYRO GUILD WITHOUT TEST",
        "DIRECT GRAND FINAL SLOT IN (1K TOURNAMENT)"
      ] 
    }
  ];

  // --- 🛑 SCROLL LOCK ---
  useEffect(() => {
    document.body.style.overflow = selectedPlan ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedPlan]);

  const copyUPI = () => {
    navigator.clipboard.writeText("zyroesports@upi");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault(); 
    if (!auth.currentUser) return addNotification('error', "Login Required!");
    if (!isFormValid) return addNotification('error', "Fill all details!");

    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. Upload Screenshot to Cloudinary
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: data });
      if (!res.ok) throw new Error("Upload Failed");
      const fileData = await res.json();

      // 2. Create order ID
      const orderId = `ZYRO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // 3. Fetch current user data
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const currentUserData = userSnap.exists() ? userSnap.data() : {};

      // 4. Create Subscription Request (Goes to admin for approval)
      await setDoc(doc(db, "subscriptions", orderId), {
        // User details
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: formData.fullName,
        userWhatsapp: formData.whatsappNo,
        
        // Plan details
        planName: selectedPlan.name,
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        pointsToAdd: selectedPlan.points, // Points to be added after approval
        
        // Payment details
        transactionId: formData.transactionId,
        screenshotUrl: fileData.secure_url,
        upiId: "zyroesports@upi",
        
        // Status and timestamps
        status: "pending", // Admin will change to "approved"
        submittedAt: serverTimestamp(),
        orderId: orderId,
        
        // User's current points (for admin reference)
        currentPoints: currentUserData.points || 0,
        
        // Admin fields (to be filled by admin)
        approvedAt: null,
        approvedBy: null,
        adminNotes: ""
      });

      // Show success message
      addNotification('success', `Payment submitted! ${selectedPlan.points} points will be added after admin approval.`);
      
      // Reset form
      setSelectedPlan(null); 
      setFormData({ 
        fullName: "", 
        whatsappNo: "",
        transactionId: "" 
      });

    } catch (err) {
      console.error(err);
      addNotification('error', "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-body pb-20 overflow-x-hidden">
      <Navbar />
      
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rosePink/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse"></div>
      </div>

      <div className="pt-28 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="text-5xl md:text-8xl font-gaming font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rosePink via-white to-yellow-500 uppercase tracking-tighter"
            >
              BUY POINTS
            </motion.h1>
            <p className="text-gray-500 font-gaming tracking-[0.4em] text-xs mt-4 uppercase">GET LOYALTY POINTS & UNLOCK REWARDS</p>
        </div>

        {/* Current Points Display */}
        {userData && (
          <div className="max-w-md mx-auto mb-12 p-6 bg-white/5 border border-white/10 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Your Current Points</p>
                <p className="text-3xl font-bold">{userData.points || 0} <span className="text-yellow-500 text-sm">pts</span></p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-1">Premium Status</p>
                <p className={`text-sm font-bold ${userData.isPremium ? 'text-yellow-500' : 'text-gray-500'}`}>
                  {userData.isPremium ? '⭐ ACTIVE' : '🔒 LOCKED'}
                </p>
              </div>
            </div>
            
            {/* Progress towards 500 points */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress to Premium (500 points)</span>
                <span>{Math.min(userData.points || 0, 500)}/500</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((userData.points || 0) / 500) * 100, 100)}%` }}
                  className="h-full bg-gradient-to-r from-rosePink to-purple-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {basePlans.map((plan, index) => (
                <motion.div 
                  key={plan.id} 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }} 
                  className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col justify-between 
                    ${plan.featured ? 'border-yellow-500 bg-black/80 shadow-[0_0_60px_rgba(234,179,8,0.2)] scale-105 z-10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                >
                    {plan.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full font-black text-[10px] uppercase shadow-lg flex items-center gap-1 whitespace-nowrap">
                        <Star size={12} fill="black"/> BEST VALUE
                      </div>
                    )}
                    
                    <div>
                      <div className="mb-4" style={{ color: plan.color }}>{plan.icon}</div>
                      <h3 className="font-gaming text-3xl font-black mb-1 italic tracking-tighter uppercase" style={{ color: plan.color }}>{plan.name}</h3>
                      
                      {/* Price & Points Display */}
                      <div className="flex flex-col gap-1 mb-6">
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black italic text-white">₹{plan.price}</span>
                            <span className="text-gray-500 text-xs font-bold uppercase">One Time</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full">
                            <Star size={12} className="text-yellow-400 fill-yellow-400"/>
                            <span className="text-xs font-bold text-yellow-400">{plan.points} LOYALTY POINTS</span>
                          </div>
                      </div>

                      <ul className="space-y-3 mb-8 text-[10px] font-bold text-gray-300 uppercase tracking-wide">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check size={14} className="text-green-500 mt-0.5 shrink-0"/> 
                              <span className="leading-tight">{f}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <button 
                      onClick={() => setSelectedPlan(plan)} 
                      className={`w-full py-4 rounded-xl font-gaming font-black text-xs uppercase tracking-widest transition-all shadow-lg 
                        ${plan.featured ? 'bg-yellow-500 text-black hover:bg-white' : 'bg-white/10 hover:bg-white hover:text-black'}`}
                    >
                      BUY NOW ⚡
                    </button>
                </motion.div>
            ))}
        </div>

        {/* Rewards Info */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-gaming font-bold mb-3">🎁 REWARDS AT 500 POINTS</h3>
            <p className="text-gray-400">Reach 500 points to unlock these benefits automatically</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
              <div className="text-2xl mb-2">🧢</div>
              <p className="font-bold">Zyro Esports Cap</p>
              <p className="text-sm text-gray-400">Exclusive merchandise</p>
            </div>
            
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-center">
              <div className="text-2xl mb-2">⭐</div>
              <p className="font-bold">Premium Status</p>
              <p className="text-sm text-gray-400">God Mode in profile</p>
            </div>
            
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-center">
              <div className="text-2xl mb-2">🎟️</div>
              <p className="font-bold">Tournament Access</p>
              <p className="text-sm text-gray-400">Direct grand final slots</p>
            </div>
          </div>
        </div>

        {/* Payment Process Info */}
        <div className="mt-12 max-w-2xl mx-auto p-6 bg-blue-500/10 border border-blue-500/30 rounded-3xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-blue-500 mt-1" size={24} />
            <div>
              <h4 className="text-lg font-bold mb-2">⚠️ IMPORTANT: Admin Approval Required</h4>
              <p className="text-gray-300 text-sm mb-2">
                After payment, your request goes to admin for verification. Points will be added manually after approval.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Send payment to: <strong>zyroesports@upi</strong></li>
                <li>• Upload clear screenshot of payment</li>
                <li>• Include Transaction ID in the form</li>
                <li>• Points added within 24 hours after admin verification</li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- PAYMENT MODAL --- */}
        <AnimatePresence>
            {selectedPlan && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 overflow-y-auto py-10">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedPlan(null)}></motion.div>
                    
                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col items-center z-[201] my-auto">
                        <button onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-all z-10">
                          <X size={16}/>
                        </button>

                        <div className="p-8 w-full flex flex-col items-center">
                            <div className="text-center mb-6">
                                <div className="inline-flex p-3 bg-gradient-to-r from-rosePink to-purple-600 rounded-2xl mb-4">
                                    <Gift size={32} />
                                </div>
                                <h3 className="text-2xl font-gaming font-bold mb-2">{selectedPlan.name}</h3>
                                <p className="text-4xl font-gaming font-black text-white mb-3">₹{selectedPlan.price}</p>
                                <div className="text-sm text-yellow-500 font-bold mb-3 flex items-center justify-center gap-2">
                                    <Star size={14} className="fill-yellow-500"/> 
                                    Get {selectedPlan.points} Points After Approval
                                </div>
                            </div>

                            {/* Payment Instructions with QR Code */}
                            <div className="bg-white/5 p-6 rounded-2xl mb-6 w-full">
                                <p className="text-center text-sm font-bold mb-4">Scan QR Code or Use UPI ID:</p>
                                
                                {/* QR Code Image */}
                                <div className="flex justify-center mb-4">
                                  <div className="bg-white p-3 rounded-xl">
                                    <img 
                                      src={QR_CODE_URL} 
                                      alt="Scan QR Code to Pay" 
                                      className="w-48 h-48 object-contain"
                                      onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/200x200?text=QR+Code+Here";
                                        e.target.alt = "QR Code Placeholder";
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                {/* UPI ID Section */}
                                <div className="bg-black/50 p-4 rounded-xl border border-white/10">
                                    <div className="text-center mb-2">
                                      <p className="text-xs text-gray-400">UPI ID</p>
                                      <p className="text-lg font-mono font-bold">zyroesports@upi</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                      <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-1">Amount to Send</p>
                                        <p className="text-xl font-bold">₹{selectedPlan.price}</p>
                                      </div>
                                      <button 
                                          onClick={copyUPI}
                                          className="px-4 py-2 bg-rosePink hover:bg-rosePink/80 rounded-lg flex items-center gap-2 text-sm font-bold transition-all"
                                      >
                                          {copied ? <Check size={16} /> : <Copy size={16} />}
                                          {copied ? "Copied" : "Copy UPI"}
                                      </button>
                                    </div>
                                </div>
                                
                                {/* Important Note */}
                                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                  <p className="text-xs text-yellow-400 text-center">
                                    ⚠️ Important: Save transaction ID from your payment app
                                  </p>
                                </div>
                            </div>

                            {/* Form for details - BELOW PAYMENT SECTION */}
                            <div className="w-full space-y-3 mb-6">
                                <div>
                                  <p className="text-xs text-gray-400 mb-2 text-center uppercase">Your Details</p>
                                  <input 
                                      type="text" 
                                      placeholder="FULL NAME" 
                                      className="popup-input" 
                                      value={formData.fullName} 
                                      onChange={e => setFormData({...formData, fullName: e.target.value})} 
                                  />
                                </div>
                                <input 
                                    type="number" 
                                    placeholder="WHATSAPP NUMBER" 
                                    className="popup-input" 
                                    value={formData.whatsappNo} 
                                    onChange={e => setFormData({...formData, whatsappNo: e.target.value})} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="TRANSACTION ID / UPI REFERENCE" 
                                    className="popup-input" 
                                    value={formData.transactionId} 
                                    onChange={e => setFormData({...formData, transactionId: e.target.value})} 
                                />
                            </div>

                            {/* Upload Screenshot Button */}
                            <label className={`w-full py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${isFormValid && !loading ? 'bg-rosePink hover:bg-rosePink/80 shadow-[0_0_20px_#f43f5e]' : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'}`}>
                                {loading ? <Loader className="animate-spin" size={16}/> : <Upload size={16}/>} 
                                {loading ? "Uploading..." : (isFormValid ? "UPLOAD PAYMENT SCREENSHOT" : "FILL ALL DETAILS")}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileUpload} 
                                    disabled={!isFormValid || loading} 
                                />
                            </label>
                            
                            <p className="text-xs text-gray-500 text-center mt-4">
                                After upload, request goes to admin. Points added after verification.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>

      <style>{`
        .popup-input { 
            width: 100%; 
            background: rgba(255,255,255,0.03); 
            border: 1px solid rgba(255,255,255,0.1); 
            padding: 14px 16px; 
            border-radius: 14px; 
            font-size: 11px; 
            font-weight: 700; 
            color: white; 
            outline: none; 
            text-transform: uppercase; 
            text-align: center; 
            transition: all 0.3s; 
        }
        .popup-input:focus { 
            border-color: #f43f5e; 
            background: rgba(244,63,94,0.05); 
        }
        .popup-input::placeholder { 
            color: #555; 
        }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
      `}</style>
    </div>
  );
};

export default Subscription;