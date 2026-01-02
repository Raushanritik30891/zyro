import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Bot, User, Loader, Zap, Globe, 
  Sparkles, Crown, Trophy, CreditCard, Clock, HelpCircle, 
  Gamepad2, Shield, Gift, Award, Users, Star, TrendingUp
} from 'lucide-react';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: getWelcomeMessage('en')
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick suggestions
  const suggestions = [
    { text: "Passes ki pricing batao", icon: <Crown size={14} />, keywords: ['price', 'pricing', 'cost', 'rate', 'कीमत', 'दाम', 'ప్రైస్', 'ధర'] },
    { text: "God Mode ke benefits kya hai?", icon: <Zap size={14} />, keywords: ['god mode', 'god', 'premium', 'गॉड', 'గాడ్'] },
    { text: "Tournament schedule batao", icon: <Clock size={14} />, keywords: ['tournament', 'match', 'schedule', 'time', 'टूर्नामेंट', 'टाइम', 'టూర్నమెంట్', 'సమయం'] },
    { text: "Payment options kya hai?", icon: <CreditCard size={14} />, keywords: ['payment', 'pay', 'money', 'fund', 'भुगतान', 'पैसा', 'చెల్లింపు', 'డబ్బు'] },
    { text: "Support kaise contact karein?", icon: <HelpCircle size={14} />, keywords: ['support', 'help', 'contact', 'सम्पर्क', 'सहायता', 'సపోర్ట్', 'సహాయం'] },
    { text: "Loyalty points system", icon: <Star size={14} />, keywords: ['points', 'loyalty', 'reward', 'bonus', 'पॉइंट', 'इनाम', 'పాయింట్లు', 'రివార్డ్'] }
  ];

  // Platform information database
  const platformData = {
    passes: {
      scout: {
        name: "SCOUT PASS",
        price: "₹50/match",
        points: "10 Loyalty Points per match",
        benefits: ["Standard Support", "Manual Booking", "Basic Access"],
        color: "text-gray-300"
      },
      warrior: {
        name: "WARRIOR PASS", 
        price: "₹99/week",
        points: "20 Loyalty Points weekly",
        benefits: ["Priority Slot Booking", "Live Stream Shoutout", "5% Match Discount"],
        color: "text-pink-400"
      },
      godMode: {
        name: "GOD MODE",
        price: "₹199/week",
        points: "30 Loyalty Points weekly",
        benefits: ["Direct Grand Final Entry", "Free Zyro Cap 🧢", "Verified Badge", "VIP Support 24/7", "10% Match Discount"],
        color: "text-yellow-300"
      }
    },
    tournaments: [
      { time: "10:00 AM", type: "Daily Match" },
      { time: "2:00 PM", type: "Daily Match" },
      { time: "6:00 PM", type: "Daily Match" },
      { time: "10:00 PM", type: "Daily Match" },
      { time: "8:00 PM (Sunday)", type: "Weekly Mega" },
      { time: "Last Sunday", type: "Monthly Championship" }
    ],
    support: [
      { channel: "WhatsApp", contact: "+91-XXXXXXXXXX", response: "Under 15 minutes" },
      { channel: "Email", contact: "support@zyroesports.com", response: "Within 24 hours" },
      { channel: "Telegram", contact: "t.me/zyroesports", response: "Real-time" }
    ],
    payments: ["UPI (PhonePe, GPay, Paytm)", "Credit/Debit Cards", "Net Banking", "Zyro Wallet"],
    stats: {
      totalMatches: "50,000+",
      totalUsers: "10,000+",
      payoutRate: "99.8%",
      satisfaction: "4.7/5"
    }
  };

  function getWelcomeMessage(lang) {
    const messages = {
      en: "🔥 Welcome Commander! I'm ZYRO AI - Your Ultimate Esports Assistant. Ask me about Passes, Rules, Tournaments, Payouts, or Battle Strategies! 🎮",
      hi: "🔥 स्वागत है कमांडर! मैं ZYRO AI हूँ - आपका अंतिम ईस्पोर्ट्स सहायक। पासेस, नियम, टूर्नामेंट, भुगतान या लड़ाई की रणनीति के बारे में पूछें! 🎮",
      te: "🔥 స్వాగతం కమాండర్! నేను ZYRO AI - మీ అంతిమ ఈస్పోర్ట్స్ సహాయకుడిని. పాస్లు, నియమాలు, టూర్నమెంట్లు, చెల్లింపులు లేదా యుద్ధ వ్యూహాల గురించి అడగండి! 🎮"
    };
    return messages[lang] || messages.en;
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', text: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = generateResponse(text, language);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
      setLoading(false);
    }, 800);
  };

  const generateResponse = (question, lang) => {
    const q = question.toLowerCase();
    
    // Language specific responses
    const responses = {
      en: getEnglishResponse(q),
      hi: getHindiResponse(q),
      te: getTeluguResponse(q)
    };

    return responses[lang] || responses.en;
  };

  const getEnglishResponse = (question) => {
    if (question.includes('price') || question.includes('cost') || question.includes('rate') || question.includes('pass')) {
      return `💰 **PASS PRICING** 🎮

👤 **SCOUT PASS**: ₹50/match
   • 10 Loyalty Points per match
   • Standard Support
   • Manual Booking

⚔️ **WARRIOR PASS**: ₹99/week  
   • 20 Loyalty Points weekly
   • Priority Slot Booking
   • Live Stream Shoutout
   • 5% Match Discount

👑 **GOD MODE**: ₹199/week
   • 30 Loyalty Points weekly
   • DIRECT GRAND FINAL ENTRY
   • Free Zyro Cap 🧢
   • Verified Profile Badge
   • VIP Support 24/7
   • 10% Match Discount

🏆 **LOYALTY**: 100 Points = 1 FREE Match!`;
    }

    if (question.includes('god mode') || question.includes('premium') || question.includes('ultimate')) {
      return `👑 **GOD MODE - ULTIMATE POWER** ⚡

💰 **Price**: ₹199/week (Best Value!)

🎁 **EXCLUSIVE BENEFITS**:
   • Direct Grand Final Entry
   • Free Zyro Branded Cap 🧢
   • Verified Gold Badge 👑
   • VIP Support 24/7
   • 10% Match Discount
   • Early Tournament Access
   • God Mode Leaderboard

📈 **Value**: ₹199 = 30 Points + Cap + Direct Finals!

🔥 **Limited slots available!**`;
    }

    if (question.includes('tournament') || question.includes('match') || question.includes('schedule') || question.includes('time')) {
      return `🎮 **TOURNAMENT SCHEDULE** ⏰

🏆 **DAILY MATCHES**:
   • 10:00 AM IST
   • 2:00 PM IST  
   • 6:00 PM IST
   • 10:00 PM IST

🔥 **SPECIAL EVENTS**:
   • **Weekly Mega**: Sundays 8:00 PM
   • **Monthly Championship**: Last Sunday
   • **Festival Tournaments**: Special Dates

📱 **Join WhatsApp group for instant updates!**`;
    }

    if (question.includes('payment') || question.includes('pay') || question.includes('money') || question.includes('fund')) {
      return `💳 **PAYMENT METHODS** 💰

✅ **INSTANT OPTIONS**:
   • UPI (PhonePe, GPay, Paytm)
   • Credit/Debit Cards
   • Net Banking
   • Zyro Wallet

⚡ **Payout Speed**: Under 5 minutes!
🔒 **Security**: SSL Encrypted

💰 **Refer & Earn**: ₹50 per successful referral!`;
    }

    if (question.includes('support') || question.includes('help') || question.includes('contact') || question.includes('problem')) {
      return `📞 **SUPPORT CHANNELS** 🆘

🚀 **INSTANT HELP**:
   • **WhatsApp**: +91-XXXXXXXXXX
     ↳ Response: Under 15 minutes
   
   • **Email**: support@zyroesports.com
     ↳ Response: Within 24 hours
   
   • **Telegram**: t.me/zyroesports
     ↳ Response: Real-time

🛡️ **Owner**: Captain Zyro
⏰ **Support Hours**: 24/7`;
    }

    if (question.includes('point') || question.includes('loyalty') || question.includes('reward') || question.includes('bonus')) {
      return `⭐ **LOYALTY PROGRAM** 🎯

💰 **POINTS SYSTEM**:
   • Scout Pass: 10 points/match
   • Warrior Pass: 20 points/week  
   • God Mode: 30 points/week
   • Referral: 50 points each

🎁 **REDEMPTION**:
   • 100 Points = 1 FREE Match!
   • Points NEVER expire
   • Double points on weekends

👥 **REFERRAL BONUS**:
   • Refer & Earn: ₹50 per friend
   • Both get 50 bonus points
   • Unlimited referrals!`;
    }

    if (question.includes('leaderboard') || question.includes('rank') || question.includes('top') || question.includes('winner')) {
      return `🏆 **LEADERBOARD REWARDS** 👑

🎮 **WEEKLY PRIZES**:
   • **1st Place**: ₹5000 + God Mode (1 Month)
   • **2nd Place**: ₹2500 + Warrior Pass  
   • **3rd Place**: ₹1000 + Scout Pass
   • **Top 10**: Special Badges

📊 **STATS**:
   • Total Players: 10,000+
   • Matches Played: 50,000+
   • Payout Success: 99.8%
   • Satisfaction: 4.7/5

🔗 Check real-time rankings at /leaderboard`;
    }

    // Default response
    return `🎮 **ZYRO ESPORTS - AI POWERED GAMING** ⚡

🔥 **QUICK INFO**:
   • Passes: Scout ₹50, Warrior ₹99, God Mode ₹199
   • Tournaments: Daily at 10AM, 2PM, 6PM, 10PM
   • Support: WhatsApp +91-XXXXXXXXXX
   • Payouts: Instant within 5 minutes

💡 **TIP**: Ask me about:
   • "Passes ki pricing"
   • "God Mode benefits"  
   • "Tournament schedule"
   • "Payment methods"
   • "Support contact"

🛡️ **Ready to dominate?** 🚀`;
  };

  const getHindiResponse = (question) => {
    if (question.includes('कीमत') || question.includes('दाम') || question.includes('पास') || question.includes('रुपये')) {
      return `💰 **पास की कीमत** 🎮

👤 **स्काउट पास**: ₹50/मैच
   • प्रति मैच 10 लॉयल्टी पॉइंट्स
   • स्टैंडर्ड सपोर्ट
   • मैनुअल बुकिंग

⚔️ **वॉरियर पास**: ₹99/सप्ताह  
   • साप्ताहिक 20 लॉयल्टी पॉइंट्स
   • प्रायोरिटी स्लॉट बुकिंग
   • लाइव स्ट्रीम शाउटआउट
   • 5% मैच डिस्काउंट

👑 **गॉड मोड**: ₹199/सप्ताह
   • साप्ताहिक 30 लॉयल्टी पॉइंट्स
   • डायरेक्ट ग्रैंड फाइनल एंट्री
   • फ्री जायरो कैप 🧢
   • वेरिफाइड प्रोफाइल बैज
   • वीआईपी सपोर्ट 24/7
   • 10% मैच डिस्काउंट

🏆 **लॉयल्टी**: 100 पॉइंट्स = 1 फ्री मैच!`;
    }

    if (question.includes('गॉड') || question.includes('प्रीमियम') || question.includes('अल्टीमेट')) {
      return `👑 **गॉड मोड - अल्टीमेट पावर** ⚡

💰 **कीमत**: ₹199/सप्ताह (बेस्ट वैल्यू!)

🎁 **एक्सक्लूसिव लाभ**:
   • डायरेक्ट ग्रैंड फाइनल एंट्री
   • फ्री जायरो ब्रांडेड कैप 🧢
   • वेरिफाइड गोल्ड बैज 👑
   • वीआईपी सपोर्ट 24/7
   • 10% मैच डिस्काउंट
   • अर्ली टूर्नामेंट एक्सेस
   • गॉड मोड लीडरबोर्ड

📈 **वैल्यू**: ₹199 = 30 पॉइंट्स + कैप + डायरेक्ट फाइनल्स!

🔥 **सीमित स्लॉट्स उपलब्ध!**`;
    }

    // Default Hindi response
    return `🎮 **ZYRO ESPORTS - AI पावर्ड गेमिंग** ⚡

🔥 **त्वरित जानकारी**:
   • पासेस: स्काउट ₹50, वॉरियर ₹99, गॉड मोड ₹199
   • टूर्नामेंट: दैनिक 10AM, 2PM, 6PM, 10PM
   • सपोर्ट: व्हाट्सएप +91-XXXXXXXXXX
   • भुगतान: 5 मिनट में इंस्टेंट

💡 **टिप**: मुझसे पूछें:
   • "पासेस की कीमत"
   • "गॉड मोड के लाभ"
   • "टूर्नामेंट शेड्यूल"
   • "भुगतान के तरीके"
   • "सपोर्ट कॉन्टैक्ट"

🛡️ **दबदबा कायम करने के लिए तैयार?** 🚀`;
  };

  const getTeluguResponse = (question) => {
    if (question.includes('ధర') || question.includes('ప్రైస్') || question.includes('పాస్') || question.includes('రూపాయలు')) {
      return `💰 **పాస్ ధరలు** 🎮

👤 **స్కౌట్ పాస్**: ₹50/మ్యాచ్
   • మ్యాచ్‌కు 10 లాయల్టీ పాయింట్లు
   • స్టాండర్డ్ సపోర్ట్
   • మ్యాన్యువల్ బుకింగ్

⚔️ **వారియర్ పాస్**: ₹99/వారం  
   • వారానికి 20 లాయల్టీ పాయింట్లు
   • ప్రయోరిటీ స్లాట్ బుకింగ్
   • లైవ్ స్ట్రీమ్ షౌట్ఆవుట్
   • 5% మ్యాచ్ డిస్కౌంట్

👑 **గాడ్ మోడ్**: ₹199/వారం
   • వారానికి 30 లాయల్టీ పాయింట్లు
   • డైరెక్ట్ గ్రాండ్ ఫైనల్ ఎంట్రీ
   • ఉచిత జైరో టోపీ 🧢
   • ధృవీకరించిన ప్రొఫైల్ బ్యాడ్జ్
   • VIP సపోర్ట్ 24/7
   • 10% మ్యాచ్ డిస్కౌంట్

🏆 **లాయల్టీ**: 100 పాయింట్లు = 1 ఉచిత మ్యాచ్!`;
    }

    if (question.includes('గాడ్') || question.includes('ప్రీమియం') || question.includes('అల్టిమేట్')) {
      return `👑 **గాడ్ మోడ్ - అల్టిమేట్ పవర్** ⚡

💰 **ధర**: ₹199/వారం (బెస్ట్ వేల్యూ!)

🎁 **ఎక్స్‌క్లూసివ్ బెనిఫిట్స్**:
   • డైరెక్ట్ గ్రాండ్ ఫైనల్ ఎంట్రీ
   • ఉచిత జైరో బ్రాండెడ్ టోపీ 🧢
   • ధృవీకరించిన గోల్డ్ బ్యాడ్జ్ 👑
   • VIP సపోर్ట్ 24/7
   • 10% మ్యాచ్ డిస్కౌంట్
   • ఎర్లీ టూర్నమెంట్ యాక్సెస్
   • గాడ్ మోడ్ లీడర్‌బోర్డ్

📈 **వేల్యూ**: ₹199 = 30 పాయింట్లు + టోపీ + డైరెక్ట్ ఫైనల్స్!

🔥 **పరిమిత స్లాట్లు మాత్రమే!**`;
    }

    // Default Telugu response
    return `🎮 **ZYRO ESPORTS - AI పవర్డ్ గేమింగ్** ⚡

🔥 **త్వరిత సమాచారం**:
   • పాస్లు: స్కౌట్ ₹50, వారియర్ ₹99, గాడ్ మోడ్ ₹199
   • టూర్నమెంట్లు: దైనికం 10AM, 2PM, 6PM, 10PM
   • సపోర్ట్: వాట్సాప్ +91-XXXXXXXXXX
   • చెల్లింపులు: 5 నిమిషాల్లో ఇన్స్టంట్

💡 **టిప్**: నన్ను అడగండి:
   • "పాస్ల ధరలు"
   • "గాడ్ మోడ్ ప్రయోజనాలు"
   • "టూర్నమెంట్ షెడ్యూల్"
   • "చెల్లింపు పద్ధతులు"
   • "సపోర్ట్ కాంటాక్ట్"

🛡️ **దబదబా ఏర్పరచడానికి सिद్ధమా?** 🚀`;
  };

  const handleSuggestionClick = (text) => {
    handleSend(text);
  };

  return (
    <div className="font-sans">
      
      {/* --- CHAT WINDOW --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-6 z-[9998] w-[380px] bg-gradient-to-b from-gray-900 to-black border-2 border-pink-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[550px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Bot size={22} className="text-white"/>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg tracking-wide">ZYRO AI</h3>
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> 
                    {language === 'en' ? 'Online' : language === 'hi' ? 'ऑनलाइन' : 'ఆన్‌లైన్'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Language Selector */}
                <div className="relative group">
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Globe size={18} className="text-white"/>
                  </button>
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 w-48 shadow-xl">
                      <p className="text-xs text-gray-400 mb-2">
                        {language === 'en' ? 'Select Language:' : language === 'hi' ? 'भाषा चुनें:' : 'భాష ఎంచుకోండి:'}
                      </p>
                      <button
                        onClick={() => {
                          setLanguage('en');
                          setMessages([{ role: 'bot', text: getWelcomeMessage('en') }]);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition-all ${
                          language === 'en' 
                            ? 'bg-pink-600 text-white' 
                            : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        English 🇺🇸
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('hi');
                          setMessages([{ role: 'bot', text: getWelcomeMessage('hi') }]);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition-all ${
                          language === 'hi' 
                            ? 'bg-pink-600 text-white' 
                            : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        Hindi 🇮🇳
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('te');
                          setMessages([{ role: 'bot', text: getWelcomeMessage('te') }]);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                          language === 'te' 
                            ? 'bg-pink-600 text-white' 
                            : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        Telugu 🇮🇳
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white"/>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-950 to-black">
              {messages.map((msg, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-none' 
                    : 'bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-gray-100 rounded-bl-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {msg.role === 'bot' ? (
                        <Bot size={14} className="text-green-400"/>
                      ) : (
                        <User size={14} className="text-white"/>
                      )}
                      <span className="text-xs font-bold">
                        {msg.role === 'bot' ? 'ZYRO AI' : language === 'en' ? 'You' : language === 'hi' ? 'आप' : 'మీరు'}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-line break-words">{msg.text}</div>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/80 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <Loader size={16} className="text-pink-500 animate-spin"/>
                    <span className="text-sm text-gray-300">
                      {language === 'en' ? 'ZYRO AI is typing...' : language === 'hi' ? 'ZYRO AI टाइप कर रहा है...' : 'ZYRO AI టైప్ చేస్తోంది...'}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/30 shrink-0">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                <Sparkles size={12} /> 
                {language === 'en' ? 'Quick Questions:' : language === 'hi' ? 'त्वरित प्रश्न:' : 'త్వరిత ప్రశ్నలు:'}
              </p>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-gray-300 flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                      {suggestion.icon}
                      {suggestion.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900/50 border-t border-gray-800 flex gap-3 shrink-0">
              <div className="flex-1 relative">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={
                    language === 'en' 
                      ? "Ask about prices, rules, tournaments..." 
                      : language === 'hi'
                      ? "कीमतों, नियमों, टूर्नामेंट के बारे में पूछें..."
                      : "ధరలు, నియమాలు, టూర్నమెంట్ల గురించి అడగండి..."
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-full px-4 py-3 text-sm text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 pr-12"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <Gamepad2 size={16} className="text-gray-500" />
                </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className={`p-3 rounded-full ${
                  loading || !input.trim()
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
                } transition-all duration-200`}
              >
                {loading ? (
                  <Loader size={18} className="text-white animate-spin"/>
                ) : (
                  <Send size={18} className="text-white"/>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FLOATING TRIGGER BUTTON - POSITION FIXED --- */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 z-[9999] group" // Changed from bottom-6 to bottom-8
      >
        {/* Glowing Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur-xl opacity-70 animate-pulse"></div>
        
        {/* Main Button */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-600 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? 'close' : 'open'}
              initial={{ scale: 2, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              {isOpen ? (
                <X size={24} className="text-white sm:size-28"/>
              ) : (
                <MessageSquare size={24} className="text-white sm:size-28"/>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Notification Badge */}
          {!isOpen && messages.length === 1 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] sm:text-xs font-bold">AI</span>
            </div>
          )}
        </div>
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-16 sm:right-20 bottom-1/2 transform translate-y-1/2 bg-gray-900 border border-gray-700 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hidden sm:block">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-yellow-400" />
              ZYRO AI Assistant
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></span>
            </div>
            <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gray-900 border-r border-b border-gray-700 rotate-45"></div>
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default AIChatbot;