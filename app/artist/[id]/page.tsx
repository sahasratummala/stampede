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
      <nav className="fixed left-6 top-24 z-[60]">
        <button 
          onClick={() => router.push("/texas-talent")}
          aria-label="Back to Texas Talent"
          className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-full text-white hover:bg-orange-600 hover:scale-110 transition-all shadow-2xl flex items-center justify-center"
        >
          <ArrowLeft size={24} />
        </button>
      </nav>
      <ArtistPublicProfile userId={id} />
    </main>
  );
}
