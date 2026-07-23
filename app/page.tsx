"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LandingPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage("");

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setAuthMessage(error.message);
      } else if (data.user) {
        if (data.session) {
          router.push("/onboarding/role");
        } else {
          setAuthMessage("Check your inbox to confirm your account, then continue onboarding.");
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthMessage(error.message);
      } else {
        router.push("/home");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
      <div className="text-center mb-10">
        <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter text-white leading-none">
          STAMPEDE
        </h1>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-zinc-500 mt-4">
          Style the show. <span className="text-orange-600 font-bold">Join the herd.</span>
        </p>
      </div>

      <div className="w-full max-w-md bg-zinc-950 border-4 border-orange-600 p-10 shadow-[12px_12px_0px_0px_rgba(244,72,0,0.2)]">
        <h2 className="text-white font-black uppercase italic mb-6 text-xl text-center">
          {isSignUp ? "Join the Herd" : "Enter the Herd"}
        </h2>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full bg-black border-2 border-zinc-800 p-4 font-bold uppercase tracking-widest text-xs focus:border-orange-600 outline-none text-white transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="PASSWORD"
              className="w-full bg-black border-2 border-zinc-800 p-4 font-bold uppercase tracking-widest text-xs focus:border-orange-600 outline-none text-white transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange-600 text-black font-black uppercase text-sm tracking-[0.2em] hover:bg-white transition-all border-2 border-orange-600 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : isSignUp ? "Create Account" : "Login"}
          </button>
        </form>

        {authMessage ? (
          <p
            role="status"
            className="mt-5 border border-zinc-800 bg-black p-3 text-center text-[10px] font-bold uppercase leading-relaxed tracking-[0.15em] text-zinc-400"
          >
            {authMessage}
          </p>
        ) : null}

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest hover:text-orange-600 transition-colors"
        >
          {isSignUp ? "Already have an account? Login" : "New user? Join the herd"}
        </button>
      </div>
    </div>
  );
}
