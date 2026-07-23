"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import { supabase } from "../lib/supabase";

interface NavBarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

interface AccountSummary {
  name: string;
  email: string;
  imageUrl: string;
}

const navItems = [
  { href: "/home", label: "Home" },
  { href: "/crowd-connect", label: "Crowd Connect" },
  { href: "/fit-check", label: "Fit Check" },
  { href: "/texas-talent", label: "Texas Talent" },
];

function AccountPhoto({
  imageUrl,
  initials,
  size = "small",
}: {
  imageUrl: string;
  initials: string;
  size?: "small" | "large";
}) {
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full border-2 border-background bg-accent text-white shadow-sm ring-2 ring-border ${
        size === "large" ? "h-12 w-12" : "h-10 w-10"
      }`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-black">{initials}</span>
      )}
    </div>
  );
}

export default function NavBar({ isDark, toggleTheme }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [account, setAccount] = useState<AccountSummary>({
    name: "My Account",
    email: "",
    imageUrl: "",
  });

  useEffect(() => {
    const loadAccount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile?.role) {
        setAccount((current) => ({ ...current, email: user.email ?? "" }));
        return;
      }

      const table = profile.role === "artist" ? "artists" : "listeners";
      const { data: details } = await supabase
        .from(table)
        .select("name, profileImageUrl")
        .eq("id", user.id)
        .single();

      setAccount({
        name: details?.name || user.email?.split("@")[0] || "My Account",
        email: user.email ?? "",
        imageUrl: details?.profileImageUrl || "",
      });
    };

    const handleProfileUpdate = () => void loadAccount();
    void loadAccount();
    window.addEventListener("stampede:profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("stampede:profile-updated", handleProfileUpdate);
  }, [pathname]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials =
    account.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";
  const accountNameSize =
    account.name.length > 24
      ? "text-[10px]"
      : account.name.length > 17
        ? "text-[11px]"
        : "text-sm";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-5 md:px-6">
        <div className="flex h-[76px] items-center justify-between">
          <Link href="/home" className="group">
            <span className="block text-3xl font-black uppercase italic tracking-tighter text-foreground transition-colors group-hover:text-accent">
              Stampede
            </span>
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.28em] text-muted lg:block">
              Style the show. <span className="text-accent">Join the herd.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-3 md:flex lg:gap-5 xl:gap-7">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative whitespace-nowrap py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-colors lg:text-[11px] lg:tracking-[0.14em] ${
                    active ? "text-accent" : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {active ? <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-accent" /> : null}
                </Link>
              );
            })}

            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Use Light Theme" : "Use Dark Theme"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-sm transition-all hover:border-accent"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen((open) => !open)}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                className="flex min-w-0 items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-card lg:gap-3 lg:pr-3"
              >
                <AccountPhoto imageUrl={account.imageUrl} initials={initials} />
                <span
                  title={account.name}
                  className={`hidden min-w-0 max-w-24 truncate font-bold leading-tight text-foreground lg:block xl:max-w-36 ${accountNameSize}`}
                >
                  {account.name}
                </span>
                <ChevronDown
                  size={16}
                  className={`hidden shrink-0 text-muted transition-transform lg:block ${accountMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+12px)] w-72 overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-2xl"
                >
                  <div className="flex items-center gap-3 px-3 py-3">
                    <AccountPhoto imageUrl={account.imageUrl} initials={initials} size="large" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-foreground">{account.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">{account.email}</p>
                    </div>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-foreground transition-colors hover:bg-card"
                  >
                    <User size={18} className="text-muted" />
                    View My Profile
                  </Link>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-xl text-foreground md:hidden"
          >
            {mobileMenuOpen ? "×" : "☰"}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="space-y-1 border-t border-border pb-5 pt-4 md:hidden">
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="mb-4 flex items-center gap-4 rounded-2xl bg-card p-4"
            >
              <AccountPhoto imageUrl={account.imageUrl} initials={initials} size="large" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-black text-foreground">{account.name}</p>
                <p className="truncate text-xs text-muted">{account.email || "View My Profile"}</p>
              </div>
              <ChevronDown className="-rotate-90 text-muted" size={18} />
            </Link>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.14em] ${
                  pathname === item.href ? "bg-accent/10 text-accent" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex gap-3 border-t border-border pt-4">
              <button
                onClick={toggleTheme}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-left text-sm font-bold text-foreground"
              >
                {isDark ? "Light Theme" : "Dark Theme"}
              </button>
              <button
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 py-3 text-sm font-bold text-red-500"
              >
                <LogOut size={17} />
                Log Out
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
