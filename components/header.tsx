"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AudioWaveform,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton } from "@/components/auth/sign-in-button";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { useSession } from "@/lib/contexts/session-context";
import { MobileDownloadButton } from "./mobile-download-button";

export function Header() {
  const { isAuthenticated, user } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Hide header on individual therapy chat pages (but show on sessions list)
  const hideHeader = 
    (pathname?.startsWith('/therapy/') && pathname !== '/therapy' && !pathname?.includes('/sessions')) ||
    pathname === '/matching/chat';
  
  if (hideHeader) return null;

  const navItems = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/privacy-security", label: "Privacy & Security" },
  ];

  return (
    <div className="w-full fixed top-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="absolute inset-0 border-b border-primary/10" />
      <header 
        id="main-navigation"
        className="relative max-w-6xl mx-auto px-3 sm:px-4"
        role="banner"
      >
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center space-x-1.5 sm:space-x-2 transition-opacity hover:opacity-80 min-w-0 flex-shrink"
          >
            <AudioWaveform className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-pulse-gentle flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-base sm:text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent truncate">
                HOPE AI
              </span>
              <span className="text-[10px] sm:text-xs dark:text-muted-foreground hidden sm:block truncate">
                Your mental health Companion
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <nav 
              className="hidden md:flex items-center space-x-1"
              role="navigation"
              aria-label="Main navigation"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <MobileDownloadButton variant="outline" className="hidden md:flex" />
              <ThemeToggle />

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-9 w-9 p-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              {isAuthenticated ? (
                <>
                  {user?.email === "knsalee@gmail.com" && (
                    <Button asChild variant="outline" className="hidden md:flex text-xs sm:text-sm">
                      <Link href="/admin/meditations">Admin</Link>
                    </Button>
                  )}
                  <div className="scale-90 sm:scale-100">
                    <ProfileDropdown />
                  </div>
                </>
              ) : (
                <div className="scale-90 sm:scale-100">
                  <SignInButton />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-[90]"
              style={{ top: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)' }}
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Menu content */}
            <div 
              id="mobile-navigation"
              className="md:hidden border-t border-primary/10 bg-background/98 backdrop-blur-sm relative z-[95]"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <nav className="flex flex-col space-y-0.5 py-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 active:bg-primary/10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mx-2"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label={`Navigate to ${item.label}`}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <>
                    {user?.email === "knsalee@gmail.com" && (
                      <Link
                        href="/admin/meditations"
                        className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 active:bg-primary/10 rounded-md transition-colors mx-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <div className="px-4 py-2 mx-2">
                      <ProfileDropdown />
                    </div>
                  </>
                )}
                {!isAuthenticated && (
                  <div className="px-4 py-2 mx-2">
                    <SignInButton />
                  </div>
                )}
                <div className="px-4 py-2 mx-2 border-t border-primary/10 mt-2 pt-2">
                  <MobileDownloadButton variant="outline" className="w-full" />
                </div>
              </nav>
            </div>
          </>
        )}
      </header>
    </div>
  );
}