"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Loader2, Music, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import EventCreator from "@/components/EventCreator";
import MediaPostCreator from "@/components/MediaPostCreator";

type Role = "artist" | "listener";
interface ArtistSummary {
  id: string;
  name: string;
  profileImageUrl?: string;
  genre?: string;
}

export default function TexasTalentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [followedArtists, setFollowedArtists] = useState<ArtistSummary[]>([]);

  useEffect(() => {
    const loadPage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      const { data: accountProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!accountProfile?.role) {
        router.replace("/onboarding/role");
        return;
      }

      const nextRole = accountProfile.role as Role;
      const profileTable = nextRole === "artist" ? "artists" : "listeners";
      const { data: completedProfile } = await supabase
        .from(profileTable)
        .select("id")
        .eq("id", user.id)
        .single();

      if (!completedProfile) {
        router.replace("/profile?new=1");
        return;
      }

      setUserId(user.id);
      setRole(nextRole);

      if (nextRole === "listener") {
        const { data: follows } = await supabase
          .from("follows")
          .select("artist_id")
          .eq("follower_id", user.id);

        const artistIds = follows?.map((follow) => follow.artist_id) ?? [];
        if (artistIds.length > 0) {
          const { data: artists } = await supabase
            .from("artists")
            .select("id, name, profileImageUrl, genre")
            .in("id", artistIds);
          setFollowedArtists(artists ?? []);
        }
      }

      setLoading(false);
    };

    loadPage();
  }, [router]);

  if (loading || !role || !userId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted">Loading Texas Talent...</p>
      </div>
    );
  }

  if (role === "artist") {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">
        <div className="mx-auto max-w-4xl">
          <header className="mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Texas Talent</p>
            <h1 className="mt-2 text-5xl font-black uppercase italic tracking-tighter">Artist Studio</h1>
            <p className="mt-3 max-w-xl text-muted">
              Publish music, media, and show dates for listeners to discover.
            </p>
          </header>

          <div className="grid gap-12">
            <section className="rounded-[2.5rem] border border-border bg-card p-6 md:p-10">
              <div className="mb-6 flex items-center gap-3">
                <Music className="text-accent" size={20} />
                <h2 className="text-xl font-black uppercase italic">Media drops</h2>
              </div>
              <MediaPostCreator artistId={userId} />
            </section>

            <section className="rounded-[2.5rem] border border-border bg-card p-6 md:p-10">
              <div className="mb-6 flex items-center gap-3">
                <Calendar className="text-accent" size={20} />
                <h2 className="text-xl font-black uppercase italic">Tour dates</h2>
              </div>
              <EventCreator artistId={userId} />
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Texas Talent</p>
            <h1 className="mt-2 text-5xl font-black uppercase italic tracking-tighter">Find your next favorite</h1>
            <p className="mt-3 max-w-xl text-muted">
              Discover Austin artists matched to your taste and keep up with the ones you love.
            </p>
          </div>
          <button
            onClick={() => router.push("/discover")}
            className="flex items-center justify-center gap-3 rounded-2xl bg-foreground px-7 py-4 text-xs font-black uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent hover:text-white"
          >
            <Sparkles size={17} />
            Discover Artists
          </button>
        </header>

        <section>
          <h2 className="mb-6 text-xs font-black uppercase tracking-[0.3em] text-muted">
            Artists you follow
          </h2>
          {followedArtists.length === 0 ? (
            <div className="rounded-[2.5rem] border-2 border-dashed border-border px-6 py-20 text-center">
              <Music className="mx-auto mb-4 text-muted" size={38} />
              <p className="font-black uppercase italic text-muted">Your lineup is waiting</p>
              <p className="mt-2 text-sm text-muted">Start discovering artists to build your list.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {followedArtists.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => router.push(`/artist/${artist.id}`)}
                  className="group flex items-center gap-4 rounded-[2rem] border border-border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:border-accent"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-background">
                    {artist.profileImageUrl ? (
                      <img
                        src={artist.profileImageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music className="m-auto mt-5 text-muted" size={24} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-black uppercase italic group-hover:text-accent">{artist.name}</p>
                    <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-muted">
                      {artist.genre}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
