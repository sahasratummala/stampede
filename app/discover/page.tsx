"use client";
import ArtistDiscovery from "@/components/ArtistDiscovery"; 

export default function DiscoverPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Back button nav removed for a cleaner discovery experience */}
      <ArtistDiscovery />
    </main>
  );
}
