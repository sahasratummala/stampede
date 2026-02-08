"use client";
import ArtistDiscovery from "@/components/ArtistDiscovery"; 
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DiscoverPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black">
      {/* Mini Nav so users can get back to their profile */}
      <nav className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => router.push("/profile")}
          className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/10 p-3 rounded-full text-zinc-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </button>
      </nav>

      {/* RENDER YOUR EXISTING COMPONENT HERE */}
      <ArtistDiscovery />
    </main>
  );
}