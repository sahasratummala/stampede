"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Mail, MapPin, Music2, Pencil, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { normalizeInterests } from "@/lib/profile";
import ProfileSetupForm from "@/components/ProfileSetupForm";

interface ProfileData {
  name?: string;
  bio?: string;
  genre?: string;
  major?: string;
  profileImageUrl?: string;
  photo?: string;
  coverImageUrl?: string;
  interests?: string | string[];
  instagram?: string;
  spotify?: string;
  soundcloud?: string;
  youtube?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"artist" | "listener" | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState("");

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }
    setEmail(user.email ?? "");

    const { data: profileRow } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profileRow) {
      router.push("/onboarding/role");
      return;
    }

    setRole(profileRow.role);

    const table = profileRow.role === "artist" ? "artists" : "listeners";
    const { data } = await supabase.from(table).select("*").eq("id", user.id).single();
    setProfileData(data || null);
    setLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <Loader2 className="animate-spin text-accent w-12 h-12" />
      </div>
    );
  }

  if (editing || !profileData) {
    return (
      <ProfileSetupForm
        role={role!}
        initialData={profileData || undefined}
        onComplete={() => {
          if (profileData) {
            setEditing(false);
            void loadProfile();
          } else {
            router.replace("/home");
          }
        }}
        onCancel={profileData ? () => setEditing(false) : undefined}
      />
    );
  }

  const interests = normalizeInterests(profileData.interests);

  const links = [
    ["Instagram", profileData.instagram],
    ["Spotify", profileData.spotify],
    ["SoundCloud", profileData.soundcloud],
    ["YouTube", profileData.youtube],
  ].filter(([, value]) => Boolean(value));

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Account</p>
            <h1 className="mt-2 text-5xl font-black uppercase italic tracking-tighter">Your Profile</h1>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex w-fit items-center gap-3 rounded-2xl bg-foreground px-7 py-4 text-xs font-black uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent hover:text-white"
          >
            <Pencil size={16} />
            Edit Your Profile
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-sm">
            <div className="h-32 bg-gradient-to-r from-accent to-orange-400" />
            <div className="-mt-14 px-6 pb-8">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-[5px] border-background bg-background shadow-xl">
                {profileData.profileImageUrl || profileData.photo ? (
                  <img
                    src={profileData.profileImageUrl || profileData.photo}
                    alt={`${profileData.name}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={38} className="text-muted" />
                )}
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight">{profileData.name}</h2>
              <p className="mt-1 text-sm font-semibold text-accent">
                {role === "artist" ? profileData.genre || "Artist" : profileData.major || "Listener"}
              </p>
              <span className="mt-4 inline-flex rounded-full bg-background px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted">
                {role === "artist" ? "Artist account" : "Listener account"}
              </span>

              <div className="mt-8 space-y-4 border-t border-border pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={17} className="shrink-0 text-muted" />
                  <span className="truncate">{email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <MapPin size={17} className="shrink-0" />
                  Austin, Texas
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-[2.5rem] border border-border bg-card p-8">
              <h2 className="text-xl font-black uppercase tracking-[0.16em]">About</h2>
              <p className="mt-4 whitespace-pre-wrap leading-7 text-foreground/75">
                {profileData.bio || "Add a bio to tell the herd a little about yourself."}
              </p>
            </section>

            {role === "listener" ? (
              <section className="rounded-[2.5rem] border border-border bg-card p-8">
                <div className="flex items-center gap-3">
                  <Music2 size={20} className="text-accent" />
                  <h2 className="text-xl font-black uppercase tracking-[0.16em]">Music Interests</h2>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {interests.length ? (
                    interests.map((item, index) => (
                      <span
                        key={`${item}-${index}`}
                        className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No interests added yet.</p>
                  )}
                </div>
              </section>
            ) : (
              <section className="rounded-[2.5rem] border border-border bg-card p-8">
                <div className="flex items-center gap-3">
                  <Music2 size={20} className="text-accent" />
                  <h2 className="text-xl font-black uppercase tracking-[0.16em]">Artist Links</h2>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {links.length ? (
                    links.map(([label, value]) => {
                      const href =
                        label === "Instagram" && !String(value).startsWith("http")
                          ? `https://instagram.com/${value}`
                          : String(value);
                      return (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-sm font-bold transition-colors hover:border-accent hover:text-accent"
                        >
                          {label}
                          <ExternalLink size={16} />
                        </a>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted">No artist links added yet.</p>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
