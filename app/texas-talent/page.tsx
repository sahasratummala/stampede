"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar'; // This one is likely working fine

import ArtistDiscovery from '@/components/ArtistDiscovery'; 
import ArtistProfileCreator from '@/components/ArtistProfileCreator';

export default function TexasTalentPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setRole(profile?.role || 'listener');
      }
      setLoading(false);
    }
    checkRole();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-accent font-black italic uppercase">Loading the Herd...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar /> 
      
      <div className="max-w-6xl mx-auto p-6 pt-24">
        {role === 'artist' ? (
          /* ARTIST ROLE: Sees their creation tools */
          <ArtistProfileCreator />
        ) : (
          /* LISTENER ROLE: Sees the AI swiping discovery */
          <ArtistDiscovery />
        )}
      </div>
    </div>
  );
}