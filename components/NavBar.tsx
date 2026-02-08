"use client";
import { useState } from "react";
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../stampede/app/CCLayout';
import BuddyFinder from '../app/crowd-connect/BuddyFinder';
import { UserProvider } from './UserContent';

interface NavBarProps { 
    isDark: boolean;
    toggleTheme: () => void;
}

export default function NavBar({ isDark, toggleTheme }: NavBarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="w-full border-b-4 border-accent bg-background sticky top-0 z-50 transition-colors duration-300 shadow-lg">
            <div className="max-w-7xl mx-auto px-6">
                {/* TOP ROW - Main branding and navigation */}
                <div className="flex items-center justify-between py-5">

                    {/* LOGO */}
                    <a href="/" className="group">
                        <div>
                            <span className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-accent transition-colors block">
                                STAMPEDE
                            </span>
                            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted mt-1">
                                Style the show. <span className="text-accent font-bold">Join the herd.</span>
                            </p>
                        </div>
                    </a>

                    {/* DESKTOP NAV */}
                    <div className="hidden md:flex items-center gap-10">
                        <a href="/" className="text-xs font-bold uppercase tracking-[0.2em] text-foreground hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent">
                            Home
                        </a>
                        <a href="/crowd-connect" className="text-xs font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent">
                            Crowd Connect
                        </a>
                        <a href="/fit-check" className="text-xs font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent">
                            Fit Check
                        </a>
                        <a href="/texas-talent" className="text-xs font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent">
                            Texas Talent
                        </a>

                        <div className="w-[2px] h-6 bg-border"></div>

                        {/* THEME TOGGLE */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full border-2 border-border hover:border-accent text-foreground transition-all hover:scale-110 bg-card"
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                </svg>
                            )}
                        </button>

                        {/* LOGIN/SIGNUP */}
                        <a
                            href="/login"
                            className="px-8 py-3 bg-accent text-black font-black text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all border-2 border-accent shadow-md hover:shadow-xl"
                        >
                            Login
                        </a>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-foreground border-2 border-border hover:border-accent transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* MOBILE MENU */}
                {mobileMenuOpen && (
                    <div className="md:hidden pt-6 pb-4 border-t-2 border-border space-y-4">
                        <a href="/" className="block text-sm font-bold uppercase tracking-[0.2em] text-foreground hover:text-accent transition-colors py-2">
                            Home
                        </a>
                        <a href="/crowd-connect" className="block text-sm font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors py-2">
                            Crowd Connect
                        </a>
                        <a href="/fit-check" className="block text-sm font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors py-2">
                            Fit Check
                        </a>
                        <a href="/texas-talent" className="block text-sm font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors py-2">
                            Texas Talent
                        </a>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-full border-2 border-border hover:border-accent text-foreground transition-all bg-card"
                                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {isDark ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                    </svg>
                                )}
                            </button>

                            <a
                                href="/login"
                                className="flex-1 px-6 py-3 bg-accent text-black font-black text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all border-2 border-accent text-center shadow-md"
                            >
                                Login
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}