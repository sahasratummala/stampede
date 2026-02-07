'use client';

import { useState, useEffect } from 'react';
import NavBar from './NavBar';

interface Event {
    id: string;
    title: string;
    date: string;
    venue: string;
    image?: string;
    link: string;
}

export default function EventCalendar({ initialEvents = [] }: { initialEvents?: Event[] }) {
    // --- THEME LOGIC ---
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

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

    // --- CALENDAR LOGIC ---
    const safeEvents = Array.isArray(initialEvents) ? initialEvents : [];
    const startDate = safeEvents.length > 0 ? new Date(safeEvents[0].date + 'T12:00:00') : new Date();
    const [currentDate, setCurrentDate] = useState(startDate);
    const [search, setSearch] = useState('');
    const [hostFilter, setHostFilter] = useState('All');

    const nextMonth = () => {
        const next = new Date(currentDate);
        next.setMonth(currentDate.getMonth() + 1);
        setCurrentDate(next);
    };

    const prevMonth = () => {
        const prev = new Date(currentDate);
        prev.setMonth(currentDate.getMonth() - 1);
        setCurrentDate(prev);
    };

    const filteredEvents = safeEvents.filter((event) => {
        if (hostFilter !== 'All' && event.venue !== hostFilter) return false;
        const matchesSearch = !search || event.title.toLowerCase().includes(search.toLowerCase());
        if (search && !matchesSearch) return false;
        if (search) return true;
        const [y, m] = event.date.split('-').map(Number);
        return (m - 1) === currentDate.getMonth() && y === currentDate.getFullYear();
    });

    const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!mounted) return <div className="p-12 text-center opacity-0">Loading Stampede...</div>;

    return (
        <div className="min-h-screen w-full bg-background">
            {/* NAVBAR */}
            <NavBar isDark={isDark} toggleTheme={toggleTheme} />

            {/* MAIN CONTENT */}
            <div className="w-full max-w-7xl mx-auto px-6 py-16">
                {/* CONTROLS BAR */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-border pb-6 transition-colors duration-300">

                    {!search ? (
                        <div className="flex items-center gap-8 select-none">
                            <button onClick={prevMonth} className="text-xs font-bold text-muted hover:text-accent transition-colors uppercase tracking-[0.2em]">PREV</button>
                            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-foreground">{monthLabel}</h2>
                            <button onClick={nextMonth} className="text-xs font-bold text-muted hover:text-accent transition-colors uppercase tracking-[0.2em]">NEXT</button>
                        </div>
                    ) : (
                        <div className="text-2xl font-black uppercase italic text-accent tracking-tighter">Searching "{search}"</div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="SEARCH..."
                            className="bg-transparent border-b border-border py-2 w-full md:w-64 text-foreground placeholder-muted outline-none focus:border-accent uppercase font-bold text-sm tracking-wider transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <div className="relative">
                            <select
                                className="bg-transparent border-b border-border py-2 w-full md:w-auto text-muted outline-none focus:border-accent uppercase font-bold text-sm tracking-wider cursor-pointer hover:text-foreground transition-colors appearance-none pr-8"
                                value={hostFilter}
                                onChange={(e) => setHostFilter(e.target.value)}
                            >
                                <option value="All" className="bg-background">All Hosts</option>
                                <option value="Texas Performing Arts" className="bg-background">Texas Performing Arts</option>
                                <option value="Moody Center" className="bg-background">Moody Center</option>
                                <option value="Butler School of Music" className="bg-background">Butler School of Music</option>
                            </select>
                            <div className="absolute right-0 top-3 pointer-events-none text-accent text-xs">▼</div>
                        </div>
                    </div>
                </div>

                {/* EVENTS GRID */}
                {filteredEvents.length === 0 ? (
                    <div className="py-32 text-center">
                        <p className="text-muted uppercase tracking-[0.2em] text-sm font-bold">
                            No events found in <span className="text-accent">{monthLabel}</span>
                        </p>
                        <button onClick={() => { setSearch(''); setHostFilter('All') }} className="mt-4 text-accent text-xs uppercase underline underline-offset-4">Reset Filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
                        {filteredEvents.map((event) => (
                            <a key={event.id} href={event.link} target="_blank" rel="noopener noreferrer" className="group block">
                                <div className="relative aspect-[16/10] bg-card mb-6 overflow-hidden border border-border group-hover:border-accent transition-all duration-300">
                                    {event.image ? (
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-10">
                                            <span className="font-black text-4xl italic uppercase -rotate-12 select-none text-foreground">Stampede</span>
                                        </div>
                                    )}
                                    <div className="absolute top-0 left-0 bg-accent text-black font-black text-xs px-3 py-1 uppercase tracking-widest z-10">
                                        {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-[1px] w-4 bg-accent"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">{event.venue}</span>
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground group-hover:text-accent transition-colors">{event.title}</h3>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}