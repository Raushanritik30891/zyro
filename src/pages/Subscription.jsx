import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Upload, Loader, X, Copy, Check, ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
// 👇 setDoc import karna zaroori hai
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'; 
import { useNotification } from '../context/NotificationContext'; 

// ⚠️ APNI DETAILS YAHAN CHECK KAR LENA
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwhttjvop/image/upload"; 
const UPLOAD_PRESET = "zyro esports"; 

const Subscription = () => {
  const { addNotification } = useNotification();
  const [selectedPlan, setSelectedPlan] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    whatsappNo: ""
  });

  const isFormValid = formData.fullName && formData.whatsappNo;

  const plans = [
    { 
      id: "scout", name: "SCOUT PASS", price: 49, duration: 1, points: 50, 
      color: "#60a5fa", 
      features: ["Daily Match Entry", "Basic Support", "1 Day Validity"] 
    },
    { 
      id: "god_mode", name: "GOD MODE", price: 199, duration: 7, points: 500, 
      color: "#facc15", featured: true,
      features: ["Instant Finals Entry", "Verified Gold Badge", "Priority Slot Booking", "7 Days Validity"] 
    },
    { 
      id: "warrior", name: "WARRIOR", price: 99, duration: 3, points: 200, 
      color: "#f43f5e", 
      features: ["Premium Support", "Double Points", "3 Days Validity"] 
    }
  ];

  const copyUPI = () => {
    navigator.clipboard.writeText("ritik@upi");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault(); 
    
    if (!auth.currentUser) return addNotification('error', "Login Required!");

    if (!isFormValid) {
      return addNotification('error', "Pehle Name aur Number Bharein!");
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. Upload Image
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      
      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: data });
      
      if (!res.ok) throw new Error("Cloudinary Error");
      const fileData = await res.json();

      // 2. Setup Data
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + selectedPlan.duration);

      const orderId = `ZYRO-${Math.floor(Math.random() * 1000000)}`;
      
      // 3. 🔥 CRITICAL FIX HERE: Changed updateDoc to setDoc with merge
      // Ye user create karega agar nahi hoga to
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        paymentStatus: "Pending", 
        lastRequestDate: serverTimestamp(),
        email: auth.currentUser.email, // Safety ke liye email bhi save kar rahe hain
        displayName: formData.fullName // User ka naam bhi update kar rahe hain
      }, { merge: true });

      // 4. Create Subscription Entry
      await setDoc(doc(db, "subscriptions", orderId), {
        ...formData,
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        plan: selectedPlan.name,
        amount: selectedPlan.price,
        pointsAwarded: selectedPlan.points,
        screenshot: fileData.secure_url,
        expiry: expiryDate,
        status: "Pending",
        timestamp: serverTimestamp()
      });

      addNotification('success', "Payment Uploaded! Verification in progress.");
      setSelectedPlan(null); 
      setFormData({ fullName: "", whatsappNo: "" });

    } catch (err) {
      console.error("Upload Error:", err);
      // Agar permission error hai toh ye dikhayega
      if (err.code === 'permission-denied') {
        addNotification('error', "Permission Denied! Check Firestore Rules.");
      } else {
        addNotification('error', "Upload Failed! Check Console.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-body pb-20 overflow-x-hidden">
      <Navbar />
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rosePink/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse"></div>
      </div>

      <div className="pt-32 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-gaming font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rosePink via-white to-yellow-500 uppercase tracking-tighter">SELECT POWER</h1>
            <p className="text-gray-500 font-gaming tracking-[0.4em] text-xs mt-4">UPGRADE YOUR RANK • SEASON 5</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {plans.map((plan) => (
                <motion.div key={plan.id} whileHover={{ y: -10 }} className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${plan.featured ? 'scale-110 z-20 border-yellow-500 bg-black shadow-[0_0_60px_rgba(234,179,8,0.2)]' : 'border-white/10 bg-white/5 opacity-80'}`}>
                    {plan.featured && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full font-black text-[10px] uppercase shadow-lg">Most Popular</div>}
                    <h3 className="font-gaming text-3xl font-black mb-1 italic tracking-tighter" style={{ color: plan.color }}>{plan.name}</h3>
                    <div className="text-5xl font-black italic mb-6">₹{plan.price}<span className="text-gray-500 text-xs font-bold uppercase ml-2">/ {plan.duration} Days</span></div>
                    <ul className="space-y-4 mb-10 text-sm font-medium text-gray-300">
                        {plan.features.map(f => <li key={f} className="flex items-center gap-3"><ShieldCheck size={16} className="text-green-500"/> {f}</li>)}
                    </ul>
                    <button onClick={() => setSelectedPlan(plan)} className={`w-full py-4 rounded-xl font-gaming font-black text-xs uppercase tracking-widest transition-all ${plan.featured ? 'bg-yellow-500 text-black hover:bg-white' : 'bg-white/10 hover:bg-white hover:text-black'}`}>GET PASS</button>
                </motion.div>
            ))}
        </div>

        {/* --- 🛡️ PAYMENT POPUP MODAL --- */}
        <AnimatePresence>
            {selectedPlan && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedPlan(null)}></motion.div>
                    
                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col items-center">
                        <button onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-all z-10"><X size={16}/></button>

                        <div className="p-8 w-full flex flex-col items-center">
                            
                            {/* --- 1. BIG CENTERED SCANNER --- */}
                            <div className="bg-white p-3 rounded-2xl mb-4 shadow-[0_0_40px_rgba(255,255,255,0.15)] transform hover:scale-105 transition-all">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=ritik@upi&am=${selectedPlan.price}`} className="w-48 h-48" alt="QR" />
                            </div>

                            {/* --- 2. AMOUNT --- */}
                            <div className="text-center mb-6">
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Payable Amount</p>
                                <p className="text-5xl font-gaming font-black text-white mb-3">₹{selectedPlan.price}</p>
                                <button onClick={copyUPI} className="flex items-center gap-2 text-xs font-bold bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:border-rosePink/50 transition-all mx-auto">
                                    {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>} {copied ? "COPIED" : "ritik@upi"}
                                </button>
                            </div>

                            {/* --- 3. INPUT FORM (No UTR) --- */}
                            <div className="w-full space-y-3 mb-6">
                                <input type="text" placeholder="YOUR NAME" className="popup-input" value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} />
                                <input type="number" placeholder="WHATSAPP NO" className="popup-input" value={formData.whatsappNo} onChange={e=>setFormData({...formData, whatsappNo: e.target.value})} />
                            </div>

                            {/* --- 4. UPLOAD BUTTON (Smart Disabled Logic) --- */}
                            <label 
                                className={`w-full py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all 
                                ${isFormValid && !loading 
                                    ? 'bg-rosePink cursor-pointer hover:bg-rosePink/80 shadow-[0_0_20px_#f43f5e]' 
                                    : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'}`}
                            >
                                {loading ? <Loader className="animate-spin" size={16}/> : <Upload size={16}/>}
                                {loading ? "Verifying..." : (isFormValid ? "Upload Screenshot & Join" : "Fill Details First")}
                                
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileUpload} 
                                    disabled={!isFormValid || loading} 
                                />
                            </label>

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
        .popup-input:focus { border-color: #f43f5e; background: rgba(244,63,94,0.05); }
        .popup-input::placeholder { color: #555; }
        
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

export default Subscription;