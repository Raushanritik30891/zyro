import React from 'react';
import Navbar from '../components/Navbar';
import { FileText, AlertTriangle, Gavel, Ban } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#020202] text-white font-body pb-20 overflow-x-hidden">
      <Navbar />
      <div className="pt-32 px-4 max-w-4xl mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-gaming font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase tracking-tighter">TERMS OF SERVICE</h1>
          <p className="text-gray-500 font-gaming tracking-[0.4em] text-xs mt-4 uppercase">RULES OF ENGAGEMENT</p>
        </div>

        <div className="space-y-8">
            <Section icon={<Gavel className="text-yellow-500"/>} title="Acceptance of Terms">
                By accessing or using Zyro Esports, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
            </Section>

            <Section icon={<Ban className="text-red-500"/>} title="Fair Play Policy">
                Any use of cheats, hacks, emulators (unless specified), or teaming in solo matches will result in an immediate permanent ban and forfeiture of all winnings.
            </Section>

            <Section icon={<FileText className="text-blue-500"/>} title="Refund Policy">
                Entry fees are non-refundable once the match schedule is published. Refunds are only processed if a tournament is cancelled by the organizers.
            </Section>

            <Section icon={<AlertTriangle className="text-orange-500"/>} title="User Conduct">
                Harassment, toxic behavior, or hate speech towards other players or staff will not be tolerated and may lead to account suspension.
            </Section>
        </div>

      </div>
    </div>
  );
};

const Section = ({ icon, title, children }) => (
    <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl hover:border-white/20 transition-all">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
            <h3 className="text-xl font-gaming font-black text-white uppercase">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
    </div>
);

export default Terms;