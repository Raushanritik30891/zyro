import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, Youtube, Globe, MessageCircle, 
  Mail, Clock, ArrowRight, ShieldCheck 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-12 pb-6 relative overflow-hidden font-body">
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* --- TOP SECTION: BRAND & SUBSCRIBE --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12 border-b border-white/5 pb-8">
          
          {/* Brand Info */}
          <div className="lg:w-1/3 space-y-4">
            <h2 className="text-2xl font-gaming font-black italic text-white uppercase tracking-tighter flex items-center gap-2">
              <span className="text-yellow-400"><ZapIcon/></span> ZYRO ESPORTS
            </h2>
            <p className="text-gray-400 text-xs leading-relaxed uppercase tracking-wide">
              India's premier Esports ecosystem. We provide automated tournaments, instant payouts, and a fair-play environment for underdogs.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a 
                href="https://www.instagram.com/zyro_sports.7?igsh=MWE4b2l1NGhwa3RiMA==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all"
              >
                <Instagram size={16} className="text-gray-400 hover:text-pink-500"/>
              </a>
              <a 
                href="https://whatsapp.com/channel/0029Vb78Cm842DcmsSYTRE33" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all"
              >
                <WhatsAppIcon size={16} className="text-gray-400 hover:text-green-500"/>
              </a>
            </div>
          </div>

          {/* Subscribe Box */}
          <div className="lg:w-1/2 bg-white/5 p-6 rounded-2xl border border-white/5">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2">🚀 Stay Updated</h4>
            <p className="text-gray-500 text-xs mb-4">Get tournament alerts and news directly to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="email" placeholder="Enter your email..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-400 outline-none transition-all"/>
              <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                Subscribe <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        </div>

        {/* --- MIDDLE SECTION: LINKS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          
          {/* COLUMN 1: EXPLORE */}
          <div>
            <h4 className="text-yellow-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck size={14}/> EXPLORE</h4>
            <ul className="space-y-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <li><Link to="/" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12}/> Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12}/> About Us</Link></li>
              <li><Link to="/matches" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12}/> Matches</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12}/> Leaderboards</Link></li>
            </ul>
          </div>

          {/* COLUMN 2: LEGAL */}
          <div>
            <h4 className="text-yellow-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck size={14}/> LEGAL</h4>
            <ul className="space-y-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <li><Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12}/> Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12}/> Terms of Service</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={12}/> Help Center</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: CONTACT EMAIL */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">📞 CONTACT</h4>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <Mail className="text-yellow-400 mb-2" size={20}/>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Email Us</p>
                <a href="mailto:zyro.esports.7@gmail.com" className="text-white font-bold text-xs hover:text-yellow-400 transition-colors">zyro.esports.7@gmail.com</a>
            </div>
          </div>

          {/* COLUMN 4: SUPPORT HOURS */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">⏰ HOURS</h4>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <Clock className="text-yellow-400 mb-2" size={20}/>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Support Hours</p>
                <p className="text-white font-bold text-xs">8:00 AM - 12:00 PM</p>
            </div>
          </div>

        </div>

        {/* --- BOTTOM SECTION --- */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            © 2026 ZYRO ESPORTS. DESIGNED BY RITIK RAUSHAN. CONNECT WITH US ON{' '}
            <a 
              href="https://wa.me/9142702533" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-yellow-400 hover:text-yellow-300 ml-1"
            >
              WHATSAPP
            </a>
            {' '}OR{' '}
            <a 
              href="https://www.instagram.com/_cool__dude___69?igsh=bnI4OXhsdWlsdnds" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-yellow-400 hover:text-yellow-300 ml-1"
            >
              INSTAGRAM
            </a>.
          </p>
        </div>

      </div>
    </footer>
  );
};

// Helper Icons
const ZapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ChevronRight = ({size}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6"/>
    </svg>
);

const WhatsAppIcon = ({size}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="currentColor"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.663 4.1 1.789 5.731L.044 23.677c-.118.365.022.76.337.998.315.238.735.257 1.07.054l5.433-3.363A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" fill="currentColor"/>
    </svg>
);

export default Footer;