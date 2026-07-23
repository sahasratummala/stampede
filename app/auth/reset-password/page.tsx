"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Checking your reset link...");

  useEffect(() => {
    let active = true;

    const markReady = () => {
      if (!active) return;
      setReady(true);
      setMessage("");
    };

    const verifyResetLink = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          markReady();
        } else if (active) {
          setMessage("This reset link is invalid or has expired. Please request a new one.");
        }
      } catch (error: unknown) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Unable to verify your reset link.");
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        markReady();
      }
    });

    verifyResetLink();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage("Password updated successfully.");
      await supabase.auth.signOut();
      window.setTimeout(() => router.replace("/?password-reset=success"), 700);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Unable to update your password right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-[12px_12px_0px_0px_rgba(244,72,0,0.2)]">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Reset Password</h1>
        <p className="mt-3 text-sm text-zinc-500">
          Choose a new password for your Stampede account.
        </p>

        {message ? (
          <p className="mt-5 rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            {message}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="NEW PASSWORD"
            className="w-full bg-black border-2 border-zinc-800 p-4 font-bold uppercase tracking-widest text-xs focus:border-orange-600 outline-none text-white transition-colors"
            required
            disabled={!ready || loading}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="CONFIRM PASSWORD"
            className="w-full bg-black border-2 border-zinc-800 p-4 font-bold uppercase tracking-widest text-xs focus:border-orange-600 outline-none text-white transition-colors"
            required
            disabled={!ready || loading}
          />

          <button
            type="submit"
            disabled={loading || !ready}
            className="w-full py-4 bg-orange-600 text-black font-black uppercase text-sm tracking-[0.2em] hover:bg-white transition-all border-2 border-orange-600 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
