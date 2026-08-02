"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home as HomeIcon, Camera, BookOpen, TrendingUp, User, LogOut, Sparkles } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Wordmark } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/homework", label: "Homework", icon: Camera },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/chat", label: "Ask Easy", icon: Sparkles },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
];

function Squiggle({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={style}>
      <path
        d="M1 6c8-6 14 4 22 0s14-8 22-2 14 6 22 1 14-6 22 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Shell({
  children,
  showNav = true,
  wide = false,
}: {
  children: React.ReactNode;
  showNav?: boolean;
  wide?: boolean;
}) {
  return (
    <div style={{ background: PALETTE.bg, minHeight: "100vh" }} className="w-full flex min-w-0">
      {showNav && <Sidebar />}
      <div
        className="dot-grain flex-1 min-w-0 flex justify-center px-6 py-10 sm:px-8"
        style={{ color: PALETTE.ink, paddingBottom: showNav ? 96 : undefined }}
      >
        <div className="w-full min-w-0" style={{ maxWidth: wide ? 1180 : 720 }}>
          {children}
        </div>
      </div>
      {showNav && <MobileNav />}
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className="hidden sm:flex flex-col justify-between py-6 px-4 flex-shrink-0"
      style={{ width: 216, borderRight: `1px solid ${PALETTE.line}`, background: PALETTE.card, minHeight: "100vh" }}
    >
      <div>
        <div className="px-2 mb-8">
          <Wordmark />
        </div>
        <div className="flex flex-col gap-1">
          {TABS.map((t) => {
            const active = pathname?.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors duration-150"
                style={{ color: active ? PALETTE.accent : PALETTE.inkSoft }}
              >
                <span className="contents">
                  <Icon size={16} color={active ? PALETTE.accent : PALETTE.inkSoft} />
                  <span className="text-sm" style={{ fontWeight: active ? 700 : 500, color: active ? PALETTE.accent : PALETTE.ink }}>
                    {t.label}
                  </span>
                  {active && <Squiggle style={{ position: "absolute", left: 39, bottom: 3, width: 40, height: 6 }} />}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <button
        onClick={signOut}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 hover:bg-black/[0.03]"
        style={{ color: PALETTE.inkSoft }}
      >
        <LogOut size={16} />
        <span className="text-sm font-medium">Sign out</span>
      </button>
    </div>
  );
}

function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px) saturate(1.6)",
        WebkitBackdropFilter: "blur(16px) saturate(1.6)",
        borderTop: `1px solid ${PALETTE.line}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map((t) => {
        const active = pathname?.startsWith(t.href);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors duration-150"
          >
            <span className="contents">
              <Icon size={18} color={active ? PALETTE.accent : PALETTE.inkSoft} />
              <span className="text-[10px]" style={{ fontWeight: active ? 700 : 500, color: active ? PALETTE.accent : PALETTE.inkSoft }}>
                {t.label}
              </span>
              {active && <Squiggle style={{ width: 26, height: 5, color: PALETTE.accent }} />}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
