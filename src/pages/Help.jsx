import React from 'react';
import Navbar from '../components/Navbar';
import { HelpCircle, MessageSquare, Mail, Phone } from 'lucide-react';

const Help = () => {
  return (
    <div className="min-h-screen bg-[#020202] text-white font-body pb-20 overflow-x-hidden">
      <Navbar />
      <div className="pt-32 px-4 max-w-4xl mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-gaming font-black italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 uppercase tracking-tighter">HELP CENTER</h1>
          <p className="text-gray-500 font-gaming tracking-[0.4em] text-xs mt-4 uppercase">WE ARE HERE TO ASSIST</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <ContactCard 
                icon={<MessageSquare size={32} className="text-green-500"/>}
                title="WhatsApp Support"
                desc="Instant replies for urgent queries."
                action="Chat Now"
                link="https://wa.me/918273264725"
            />
            <ContactCard 
                icon={<Mail size={32} className="text-blue-500"/>}
                title="Email Support"
                desc="For business & account issues."
                action="Send Email"
                link="mailto:support@zyroesports.com"
            />
        </div>

        <div className="space-y-6">
            <h3 className="text-2xl font-gaming font-black text-white uppercase mb-6">Frequently Asked Questions</h3>
            <FAQ question="How do I join a tournament?" answer="Go to the 'Matches' tab, select an open tournament, and click 'Join via WhatsApp'. Follow the instructions sent by our bot."/>
            <FAQ question="When do I get the Room ID/Password?" answer="Room ID and Password are shared 10-15 minutes before the match start time on our official WhatsApp group."/>
            <FAQ question="How do I claim my winnings?" answer="Winnings are credited to your wallet within 24 hours. You can request a withdrawal via UPI from your Profile page."/>
        </div>

      </div>
    </div>
  );
};

const ContactCard = ({ icon, title, desc, action, link }) => (
    <a href={link} target="_blank" rel="noreferrer" className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl hover:border-rosePink/50 transition-all group text-center flex flex-col items-center">
        <div className="p-4 bg-white/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{desc}</p>
        <span className="text-rosePink font-black uppercase text-xs tracking-widest border-b border-rosePink pb-1">{action}</span>
    </a>
);

const FAQ = ({ question, answer }) => (
    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl">
        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><HelpCircle size={16} className="text-rosePink"/> {question}</h4>
        <p className="text-gray-400 text-sm ml-6">{answer}</p>
    </div>
);

export default Help;