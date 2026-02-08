"use client";
import { useParams, useRouter } from "next/navigation";
import ArtistPublicProfile from "@/components/ArtistPublicProfile";
import { ArrowLeft } from "lucide-react";

export default function ArtistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <main className="min-h-screen bg-black relative">
      {/* FLOATING BACK BUTTON 
        This allows the listener to go back to the Discovery swipe cards
      */}
      <nav className="fixed top-6 left-6 z-[60]">
        <button 
          onClick={() => router.back()}
          className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-full text-white hover:bg-orange-600 hover:scale-110 transition-all shadow-2xl flex items-center justify-center"
        >
          <ArrowLeft size={24} />
        </button>
      </nav>

      {/* THE PUBLIC VIEW 
        This component handles fetching the handles, videos, and shows.
      */}
      <ArtistPublicProfile userId={id} />
    </main>
  );
}