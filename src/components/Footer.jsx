import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Youtube, MessageCircle, Shield, Heart, Headphones, Mail, FileText, HelpCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black/90 border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-rosePink/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-3xl font-gaming font-black italic text-white uppercase tracking-tighter">
              ZYRO <span className="text-transparent bg-clip-text bg-gradient-to-r from-rosePink to-purple-600">ESPORTS</span>
            </h2>
            <p className="text-gray-500 text-xs leading-relaxed uppercase tracking-widest">
              The ultimate dimension for elite gamers. Dominate the arena, claim your glory.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-gaming text-white font-bold mb-6 uppercase">Navigation</h4>
            <ul className="space-y-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <li><Link to="/" className="hover:text-rosePink transition-colors">Base</Link></li>
              <li><Link to="/matches" className="hover:text-rosePink transition-colors">War Zone</Link></li>
              <li><Link to="/leaderboard" className="hover:text-rosePink transition-colors">Hall of Fame</Link></li>
              <li><Link to="/subscription" className="hover:text-rosePink transition-colors">Store</Link></li>
            </ul>
          </div>

          {/* Enhanced Support Section */}
          <div>
            <h4 className="font-gaming text-white font-bold mb-6 uppercase flex items-center gap-2">
              <Shield size={16} className="text-rosePink" /> Support Hub
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/support/tickets" className="group flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-rosePink transition-colors uppercase tracking-widest">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-rosePink/20 transition-all">
                    <HelpCircle size={14} />
                  </div>
                  <span>Help Center</span>
                </Link>
              </li>
              <li>
                <a href="mailto:support@zyroesports.com" className="group flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-rosePink transition-colors uppercase tracking-widest">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-rosePink/20 transition-all">
                    <Mail size={14} />
                  </div>
                  <span>Email Support</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-rosePink transition-colors uppercase tracking-widest">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-rosePink/20 transition-all">
                    <FileText size={14} />
                  </div>
                  <span>Documentation</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-rosePink transition-colors uppercase tracking-widest">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-rosePink/20 transition-all">
                    <Headphones size={14} />
                  </div>
                  <span>24/7 Live Chat</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-gaming text-white font-bold mb-6 uppercase">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-rosePink hover:text-white transition-all"><Instagram size={18}/></a>
              <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-rosePink hover:text-white transition-all"><Youtube size={18}/></a>
              <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-rosePink hover:text-white transition-all"><Twitter size={18}/></a>
              <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-green-500 hover:text-black transition-all"><MessageCircle size={18}/></a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <p>© 2024 ZYRO ESPORTS. ALL RIGHTS RESERVED.</p>
          <p className="flex items-center gap-1">Forged with <Heart size={10} className="text-rosePink fill-rosePink"/> by <span className="text-white">Ritik Raushan</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;