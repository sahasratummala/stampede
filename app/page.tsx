"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert(error.message);
    } else {
        // Everyone goes here first!
        router.push("/events");
    }
    setLoading(false);
};

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter text-foreground leading-none">
          STAMPEDE
        </h1>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-muted mt-4">
          Style the show. <span className="text-accent font-bold">Join the herd.</span>
        </p>
      </div>

      <div className="w-full max-w-md bg-card border-4 border-accent p-10 shadow-[12px_12px_0px_0px_rgba(244,72,0,0.2)]">
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            className="w-full bg-background border-2 border-border p-4 font-bold uppercase tracking-widest text-xs focus:border-accent outline-none text-foreground"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            className="w-full bg-background border-2 border-border p-4 font-bold uppercase tracking-widest text-xs focus:border-accent outline-none text-foreground"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-black font-black uppercase text-sm tracking-[0.2em] hover:bg-foreground hover:text-background transition-all border-2 border-accent flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Enter the Herd"}
          </button>
        </form>
      </div>
    </div>
  );
}