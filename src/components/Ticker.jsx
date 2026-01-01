import React from 'react';

const Ticker = ({ content }) => {
  // Agar admin ne content nahi diya, toh ye default chalega
  const text = content || "PREMIUM BENEFITS: 1-WEEK PACKAGE FOR ₹200! Direct Grand Final Slot! Early IDP Pass! Priority Support! Free Zyro Esports Cap!";

  return (
    <div className="w-full bg-gradient-to-r from-red-900 via-gokuOrange to-red-900 py-2 border-y-2 border-saiyanGold shadow-[0_0_20px_rgba(249,115,22,0.5)] overflow-hidden relative z-40">
      <div className="whitespace-nowrap animate-marquee flex items-center">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="mx-8 text-white font-gaming font-bold tracking-wider text-sm md:text-base drop-shadow-md">
            ⚡ {text}
          </span>
        ))}
      </div>
      
      {/* CSS for Marquee inside component just to be safe */}
      <style>{`
        .animate-marquee { animation: marquee 20s linear infinite; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Ticker;