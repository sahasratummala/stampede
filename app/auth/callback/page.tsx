"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Confirming your account...");

  useEffect(() => {
    const finishSignIn = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("We could not confirm this sign-in link.");
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!profile?.role) {
          router.replace("/onboarding/role");
          return;
        }

        const profileTable = profile.role === "artist" ? "artists" : "listeners";
        const { data: completedProfile } = await supabase
          .from(profileTable)
          .select("id")
          .eq("id", user.id)
          .single();

        router.replace(completedProfile ? "/home" : "/profile?new=1");
      } catch (error: unknown) {
        setMessage(
          error instanceof Error
            ? error.message
            : "This confirmation link is invalid or has expired."
        );
      }
    };

    finishSignIn();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="text-center">
        <Loader2 className="mx-auto mb-5 animate-spin text-orange-600" size={40} />
        <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">{message}</p>
      </div>
    </main>
  );
}
