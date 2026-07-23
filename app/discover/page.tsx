"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ArtistDiscovery from "@/components/ArtistDiscovery";

export default function DiscoverPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black">
      {/* Return discovery users to the Texas Talent hub. */}
      <nav className="pointer-events-none fixed left-0 right-0 top-20 z-[60] flex items-center justify-between p-6">
        <button
          onClick={() => router.push("/texas-talent")}
          aria-label="Back to Texas Talent"
          className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/10 p-3 rounded-full text-zinc-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </button>
      </nav>

      <ArtistDiscovery />
    </main>
  );
}