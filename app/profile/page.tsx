"use client";
import Link from "next/link";
import { Music, Zap, Users, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center">
        <div className="inline-block bg-orange-600/10 border border-orange-500/20 px-4 py-1 rounded-full text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-pulse">
          Live at UT Austin
        </div>
        
        <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter leading-none mb-6">
          STAMPEDE
        </h1>
        
        <p className="max-w-xl text-zinc-500 text-lg md:text-xl font-medium mb-12 leading-relaxed">
          The underground heartbeat of the Forty Acres. 
          Connect with local artists, find house shows, and join the herd.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/login" className="flex-1 bg-white text-black font-black py-5 rounded-2xl hover:bg-orange-500 hover:text-white transition-all text-center text-lg italic uppercase tracking-tighter">
            Join the Herd
          </Link>
          <Link href="/login" className="flex-1 bg-zinc-900 border border-white/10 text-white font-black py-5 rounded-2xl hover:bg-zinc-800 transition-all text-center text-lg italic uppercase tracking-tighter">
            Sign In
          </Link>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Music />, title: "Discover", desc: "Swipe through UT's rising stars." },
          { icon: <Zap />, title: "Live", desc: "Find the best house shows tonight." },
          { icon: <Users />, title: "Connect", desc: "For Longhorns, by Longhorns." }
        ].map((feat, i) => (
          <div key={i} className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5 hover:border-orange-500/50 transition-colors">
            <div className="text-orange-500 mb-4">{feat.icon}</div>
            <h3 className="font-black uppercase italic text-xl mb-2">{feat.title}</h3>
            <p className="text-zinc-500 text-sm">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}