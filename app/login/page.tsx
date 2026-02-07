"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // UT Domain Check
    const utDomains = ["utexas.edu", "my.utexas.edu", "eid.utexas.edu"];
    const domain = email.split("@")[1];

    if (isSignUp && !utDomains.includes(domain)) {
      alert("Please use a valid UT Austin email address! 🤘");
      return;
    }

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else router.push("/onboarding/role"); // Go to role selection
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push("/profile"); // Go to their existing profile
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
      <h1 className="text-6xl font-black italic text-orange-500 mb-2">STAMPEDE</h1>
      <p className="text-zinc-500 uppercase tracking-widest text-xs mb-8">Austin's Music Underground</p>

      <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
        <input 
          type="email" placeholder="EID@utexas.edu" 
          className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:border-orange-500 outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Password" 
          className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:border-orange-500 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-orange-500 hover:text-white transition-all">
          {isSignUp ? "JOIN THE HERD" : "SIGN IN"}
        </button>
      </form>

      <button onClick={() => setIsSignUp(!isSignUp)} className="mt-6 text-zinc-500 text-sm font-bold">
        {isSignUp ? "Already a member? Sign In" : "New here? Join Now"}
      </button>
    </div>
  );
}