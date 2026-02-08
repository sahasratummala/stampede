"use client";
import { useState } from "react";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import the router for redirecting

interface NavBarProps { 
    isDark: boolean;
    toggleTheme: () => void;
}

export default function NavBar({ isDark, toggleTheme }: NavBarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter(); // Initialize the router

    const handleLogout = () => {
        // If you have any local storage or session data, clear it here:
        // localStorage.removeItem('user'); 
        
        // Redirect to the sign-in/login page (root)
        router.push('/');
    };

    return (
        <nav className="w-full border-b-4 border-accent bg-background sticky top-0 z-50 transition-colors duration-300 shadow-lg">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between py-5">

                    {/* LOGO */}
                    <Link href="/events" className="group">
                        <div>
                            <span className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-accent transition-colors block">
                                STAMPEDE
                            </span>
                            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted mt-1">
                                Style the show. <span className="text-accent font-bold">Join the herd.</span>
                            </p>
                        </div>
                    </Link>

                    {/* DESKTOP NAV */}
                    <div className="hidden md:flex items-center gap-10">
                        <Link href="/events" className="text-xs font-bold uppercase tracking-[0.2em] text-foreground hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent">
                            Home
                        </Link>
                        <Link href="/crowd-connect" className="text-xs font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent">
                            Crowd Connect
                        </Link>
                        <Link href="/fit-check" className="text-xs font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent">
                            Fit Check
                        </Link>
                        <Link href="/texas-talent" className="text-xs font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent">
                            Texas Talent
                        </Link>

                        <div className="w-[2px] h-6 bg-border"></div>

                        {/* THEME TOGGLE */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full border-2 border-border hover:border-accent text-foreground transition-all hover:scale-110 bg-card"
                        >
                            {isDark ? "☀️" : "🌙"}
                        </button>

                        {/* LOGOUT BUTTON - Desktop */}
                        <button
                            onClick={handleLogout}
                            className="text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-white transition-all active:scale-95"
                        >
                            Logout
                        </button>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-foreground border-2 border-border"
                    >
                        {mobileMenuOpen ? "✕" : "☰"}
                    </button>
                </div>

                {/* MOBILE MENU */}
                {mobileMenuOpen && (
                    <div className="md:hidden pt-6 pb-4 border-t-2 border-border space-y-4">
                        <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold uppercase tracking-[0.2em] text-foreground py-2">
                            Home
                        </Link>
                        <Link href="/crowd-connect" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold uppercase tracking-[0.2em] text-muted py-2">
                            Crowd Connect
                        </Link>
                        <Link href="/fit-check" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold uppercase tracking-[0.2em] text-muted py-2">
                            Fit Check
                        </Link>
                        <Link href="/texas-talent" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold uppercase tracking-[0.2em] text-muted py-2">
                            Texas Talent
                        </Link>
                        
                        {/* LOGOUT BUTTON - Mobile */}
                        <button
                            onClick={handleLogout}
                            className="w-full text-left text-sm font-bold uppercase tracking-[0.2em] text-accent py-4 border-t border-border"
                        >
                            Logout →
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}