"use client";
import { usePathname } from "next/navigation";
import NavWrapper from "./NavWrapper";

export default function ConditionalNav() {
  const pathname = usePathname();
  
  // List the pages where the NavBar should be HIDDEN
  const hiddenRoutes = ["/", "/onboarding/role"];
  
  if (hiddenRoutes.includes(pathname) || pathname.startsWith("/auth/")) {
    return null; // Don't render anything on the landing or role selection pages
  }

  return <NavWrapper />;
}
