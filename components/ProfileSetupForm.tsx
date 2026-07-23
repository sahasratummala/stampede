"use client";

import { useEffect, useState } from "react";
import { Camera, Globe, Instagram, Loader2, Music, Save, User, Youtube } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { normalizeInterests } from "@/lib/profile";

interface ProfileFormData {
  name: string;
  bio: string;
  genre: string;
  profileImageUrl: string;
  coverImageUrl: string;
  instagram: string;
  spotify: string;
  soundcloud: string;
  youtube: string;
  major: string;
  interests: string;
}

interface ProfileSetupFormProps {
  role: "artist" | "listener";
  initialData?: Partial<Omit<ProfileFormData, "interests">> & {
    photo?: string;
    interests?: string | string[];
  };
  onComplete: () => void;
  onCancel?: () => void;
}

export default function ProfileSetupForm({ role, initialData, onComplete, onCancel }: ProfileSetupFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    genre: "",
    profileImageUrl: "",
    coverImageUrl: "",
    instagram: "",
    spotify: "",
    soundcloud: "",
    youtube: "",
    major: "",
    interests: "",
  });

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      name: initialData.name || "",
      bio: initialData.bio || "",
      genre: initialData.genre || "",
      profileImageUrl: initialData.profileImageUrl || initialData.photo || "",
      coverImageUrl: initialData.coverImageUrl || "",
      instagram: initialData.instagram || "",
      spotify: initialData.spotify || "",
      soundcloud: initialData.soundcloud || "",
      youtube: initialData.youtube || "",
      major: initialData.major || "",
      interests: normalizeInterests(initialData.interests).join(", "),
    });
  }, [initialData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "profileImageUrl" | "coverImageUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const bucket = role === "artist" ? "artist-assets" : "avatars";
      const folder = role === "artist" ? "artists" : "avatars";
      const filePath = role === "artist" ? `${folder}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, [field]: data.publicUrl }));
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Unable to upload that image.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      if (role === "artist") {
        const { error } = await supabase
          .from("artists")
          .upsert(
            {
              id: user.id,
              name: formData.name,
              bio: formData.bio,
              genre: formData.genre,
              profileImageUrl: formData.profileImageUrl,
              coverImageUrl: formData.coverImageUrl,
              instagram: formData.instagram,
              spotify: formData.spotify,
              soundcloud: formData.soundcloud,
              youtube: formData.youtube,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (error) throw error;
      } else {
        const interests = normalizeInterests(formData.interests);
        const storedInterests = interests.join(", ");

        const { error } = await supabase
          .from("listeners")
          .upsert(
            {
              id: user.id,
              name: formData.name,
              major: formData.major,
              bio: formData.bio,
              interests: storedInterests,
              profileImageUrl: formData.profileImageUrl,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (error) throw error;

        // Crowd Connect reads its discovery cards from buddies. Keep that
        // projection in sync while /profile remains the only editor.
        const { error: buddyError } = await supabase.from("buddies").upsert(
          {
            id: user.id,
            name: formData.name,
            major: formData.major,
            bio: formData.bio,
            interests,
            photo: formData.profileImageUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        if (buddyError) throw buddyError;
      }

      window.dispatchEvent(new Event("stampede:profile-updated"));
      onComplete();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Unable to save your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">
            {initialData ? "Edit Your Profile" : "Create Your Profile"}
          </h1>
          <p className="text-muted font-bold uppercase tracking-widest text-xs mt-2">
            Your identity across all of Stampede
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {role === "artist" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-accent tracking-widest">Profile Image (Square)</label>
                  <div
                    className="h-48 bg-card rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                    onClick={() => document.getElementById("profileInput")?.click()}
                  >
                    {formData.profileImageUrl ? (
                      <img src={formData.profileImageUrl} className="w-full h-full object-cover" alt="Profile preview" />
                    ) : (
                      <Camera className="text-muted group-hover:text-accent transition-colors" size={32} />
                    )}
                    <input id="profileInput" type="file" className="hidden" onChange={(e) => handleUpload(e, "profileImageUrl")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-accent tracking-widest">Cover Banner (Wide)</label>
                  <div
                    className="h-48 bg-card rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                    onClick={() => document.getElementById("coverInput")?.click()}
                  >
                    {formData.coverImageUrl ? (
                      <img src={formData.coverImageUrl} className="w-full h-full object-cover" alt="Cover preview" />
                    ) : (
                      <Camera className="text-muted group-hover:text-accent transition-colors" size={32} />
                    )}
                    <input id="coverInput" type="file" className="hidden" onChange={(e) => handleUpload(e, "coverImageUrl")} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-card p-8 rounded-[2.5rem] border border-border">
                <input
                  placeholder="Artist / Band Name"
                  className="w-full bg-background border border-border p-4 rounded-2xl focus:border-accent outline-none font-bold text-foreground placeholder:text-muted"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <input
                  placeholder="Genre (e.g. Indie Rock / Jazz)"
                  className="w-full bg-background border border-border p-4 rounded-2xl focus:border-accent outline-none text-foreground placeholder:text-muted"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Your Narrative / Bio"
                  className="w-full bg-background border border-border p-4 rounded-2xl focus:border-accent outline-none h-32 resize-none text-foreground placeholder:text-muted"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card p-8 rounded-[2.5rem] border border-border">
                <div className="relative">
                  <Instagram className="absolute left-4 top-4 text-muted" size={18} />
                  <input
                    placeholder="Instagram Handle (no @)"
                    className="w-full bg-background border border-border p-4 pl-12 rounded-2xl text-sm focus:border-accent outline-none text-foreground placeholder:text-muted"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Music className="absolute left-4 top-4 text-muted" size={18} />
                  <input
                    placeholder="Spotify Link"
                    className="w-full bg-background border border-border p-4 pl-12 rounded-2xl text-sm focus:border-accent outline-none text-foreground placeholder:text-muted"
                    value={formData.spotify}
                    onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-4 top-4 text-muted" size={18} />
                  <input
                    placeholder="Soundcloud Link"
                    className="w-full bg-background border border-border p-4 pl-12 rounded-2xl text-sm focus:border-accent outline-none text-foreground placeholder:text-muted"
                    value={formData.soundcloud}
                    onChange={(e) => setFormData({ ...formData, soundcloud: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Youtube className="absolute left-4 top-4 text-muted" size={18} />
                  <input
                    placeholder="YouTube Link"
                    className="w-full bg-background border border-border p-4 pl-12 rounded-2xl text-sm focus:border-accent outline-none text-foreground placeholder:text-muted"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6 bg-card p-8 rounded-[2.5rem] border border-border">
              <div className="flex justify-center">
                <div className="relative w-24 h-24">
                  <div className="w-24 h-24 bg-background rounded-3xl border border-border flex items-center justify-center overflow-hidden">
                    {formData.profileImageUrl ? (
                      <img src={formData.profileImageUrl} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-muted" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-accent p-2 rounded-xl cursor-pointer hover:brightness-110 transition-colors shadow-lg border-2 border-background">
                    <Camera size={18} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "profileImageUrl")} />
                  </label>
                </div>
              </div>

              <input
                placeholder="FULL NAME"
                className="w-full bg-background border border-border p-4 rounded-2xl focus:border-accent outline-none font-bold uppercase text-foreground placeholder:text-muted"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                placeholder="MAJOR (E.G. RTF, CS)"
                className="w-full bg-background border border-border p-4 rounded-2xl focus:border-accent outline-none font-bold uppercase text-foreground placeholder:text-muted"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                required
              />
              <textarea
                placeholder="TELL US ABOUT YOUR VIBE..."
                className="w-full bg-background border border-border p-4 rounded-2xl focus:border-accent outline-none h-32 resize-none text-foreground placeholder:text-muted"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
              />
              <input
                placeholder="GENRES YOU LOVE (INDIE, TRAP...)"
                className="w-full bg-background border border-border p-4 rounded-2xl focus:border-accent outline-none font-bold uppercase text-foreground placeholder:text-muted"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {initialData && onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="rounded-[2rem] border border-border px-8 py-5 font-black uppercase italic text-muted transition-colors hover:border-accent hover:text-foreground disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-3 rounded-[2rem] bg-foreground py-5 text-xl font-black uppercase italic text-background shadow-xl transition-all hover:bg-accent hover:text-white disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
