'use client'; // This must be a Client Component

import { useState, useEffect } from 'react';
import NavBar from './NavBar';

export default function NavWrapper() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    // 1. Check LocalStorage / System Preference on Load
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('theme');

        if (saved === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // 2. Toggle Logic
    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    // Prevent hydration mismatch (don't render until client loads)
    if (!mounted) return <div className="h-20 w-full bg-background"></div>;

    // 3. Render the actual NavBar with props
    return <NavBar isDark={isDark} toggleTheme={toggleTheme} />;
}