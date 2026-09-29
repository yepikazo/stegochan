"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";

type TransitionPhase = "idle" | "covering" | "revealing";
type NavigateWithTransition = (href: string) => void;

const SHARD_BASE_CLASS =
  "absolute inset-0 block size-full border border-[#ebe4d1]/[0.19] opacity-0 [filter:drop-shadow(0_12px_22px_rgba(0,0,0,var(--shard-shadow,0.28)))_drop-shadow(0_0_3px_rgba(235,228,209,var(--shard-rim,0.17)))] before:absolute before:inset-0 before:content-[''] before:[clip-path:inherit] before:[background:linear-gradient(var(--glass-shadow-angle),rgba(4,5,7,0.38),transparent_var(--shade-falloff,68%)),linear-gradient(var(--glass-light-angle),rgba(235,228,209,var(--rim-strength,0.16)),transparent_var(--rim-falloff,18%))] before:[opacity:var(--shade-strength,0.5)] after:absolute after:inset-0 after:content-[''] after:[clip-path:inherit] after:[background:linear-gradient(var(--glass-light-angle),transparent_calc(var(--reflection-position,32%)_-_5%),rgba(235,228,209,0.045)_calc(var(--reflection-position,32%)_-_1%),rgba(235,228,209,var(--reflection-strength,0.3))_var(--reflection-position,32%),rgba(235,228,209,0.09)_calc(var(--reflection-position,32%)_+_var(--reflection-width,2%)),transparent_calc(var(--reflection-position,32%)_+_var(--reflection-width,2%)_+_7%),transparent_100%),linear-gradient(var(--glass-light-angle),transparent_calc(var(--warm-position,82%)_-_3%),rgba(243,184,63,var(--warm-strength,0.09))_var(--warm-position,82%),transparent_calc(var(--warm-position,82%)_+_7%))] after:[mix-blend-mode:screen] after:[opacity:0.94] motion-reduce:animate-none";

const GLASS_SHARDS = [
  "[clip-path:polygon(0_0,35%_0,25%_25%,0_40%)] [background:linear-gradient(var(--glass-light-angle),rgba(243,184,63,0.17)_0%,rgba(243,184,63,0.04)_100%)] [--sx:-80px] [--sy:-100px] [--sr:-25deg] [--sd:20ms] [--reflection-position:24%] [--reflection-width:1.5%] [--reflection-strength:0.24] [--shade-strength:0.44] [--shade-falloff:64%] [--rim-strength:0.15] [--rim-falloff:15%] [--warm-position:78%] [--warm-strength:0.07] [--shard-shadow:0.3] [--shard-rim:0.15]",
  "[clip-path:polygon(35%_0,75%_0,55%_30%,25%_25%)] [background:linear-gradient(var(--glass-light-angle),rgba(235,228,209,0.16)_0%,rgba(235,228,209,0.035)_100%)] [--sx:0px] [--sy:-120px] [--sr:15deg] [--sd:40ms] [--reflection-position:42%] [--reflection-width:2.5%] [--reflection-strength:0.3] [--shade-strength:0.38] [--shade-falloff:72%] [--rim-strength:0.2] [--rim-falloff:20%] [--warm-position:67%] [--warm-strength:0.06] [--shard-shadow:0.24] [--shard-rim:0.2]",
  "[clip-path:polygon(75%_0,100%_0,100%_30%,80%_40%,55%_30%)] [background:linear-gradient(var(--glass-light-angle),rgba(243,184,63,0.19)_0%,rgba(243,184,63,0.045)_100%)] [--sx:100px] [--sy:-80px] [--sr:35deg] [--sd:10ms] [--reflection-position:30%] [--reflection-width:1.8%] [--reflection-strength:0.27] [--shade-strength:0.46] [--shade-falloff:62%] [--rim-strength:0.17] [--rim-falloff:16%] [--warm-position:84%] [--warm-strength:0.08] [--shard-shadow:0.32] [--shard-rim:0.16]",
  "[clip-path:polygon(0_40%,25%_25%,45%_50%,15%_70%,0_80%)] [background:linear-gradient(var(--glass-light-angle),rgba(235,228,209,0.14)_0%,rgba(243,184,63,0.05)_100%)] [--sx:-140px] [--sy:-10px] [--sr:-10deg] [--sd:30ms] [--reflection-position:54%] [--reflection-width:2%] [--reflection-strength:0.21] [--shade-strength:0.34] [--shade-falloff:74%] [--rim-strength:0.13] [--rim-falloff:13%] [--warm-position:73%] [--warm-strength:0.055] [--shard-shadow:0.26] [--shard-rim:0.13]",
  "[clip-path:polygon(25%_25%,55%_30%,45%_50%)] [background:linear-gradient(var(--glass-light-angle),rgba(243,184,63,0.23)_0%,rgba(243,184,63,0.055)_100%)] [--sx:-40px] [--sy:-60px] [--sr:-45deg] [--sd:60ms] [--reflection-position:26%] [--reflection-width:3%] [--reflection-strength:0.38] [--shade-strength:0.32] [--shade-falloff:78%] [--rim-strength:0.23] [--rim-falloff:22%] [--warm-position:71%] [--warm-strength:0.11] [--shard-shadow:0.2] [--shard-rim:0.24]",
  "[clip-path:polygon(80%_40%,100%_30%,100%_75%,65%_65%,45%_50%)] [background:linear-gradient(var(--glass-light-angle),rgba(235,228,209,0.15)_0%,rgba(243,184,63,0.05)_100%)] [--sx:130px] [--sy:20px] [--sr:18deg] [--sd:25ms] [--reflection-position:48%] [--reflection-width:2.2%] [--reflection-strength:0.26] [--shade-strength:0.42] [--shade-falloff:66%] [--rim-strength:0.18] [--rim-falloff:17%] [--warm-position:86%] [--warm-strength:0.07] [--shard-shadow:0.3] [--shard-rim:0.18]",
  "[clip-path:polygon(0_80%,15%_70%,35%_100%,0_100%)] [background:linear-gradient(var(--glass-light-angle),rgba(243,184,63,0.17)_0%,rgba(243,184,63,0.04)_100%)] [--sx:-90px] [--sy:90px] [--sr:-30deg] [--sd:15ms] [--reflection-position:61%] [--reflection-width:1.7%] [--reflection-strength:0.23] [--shade-strength:0.4] [--shade-falloff:70%] [--rim-strength:0.15] [--rim-falloff:15%] [--warm-position:76%] [--warm-strength:0.07] [--shard-shadow:0.31] [--shard-rim:0.15]",
  "[clip-path:polygon(15%_70%,45%_50%,65%_65%,50%_100%,35%_100%)] [background:linear-gradient(var(--glass-light-angle),rgba(235,228,209,0.16)_0%,rgba(235,228,209,0.035)_100%)] [--sx:-10px] [--sy:120px] [--sr:10deg] [--sd:35ms] [--reflection-position:37%] [--reflection-width:2.6%] [--reflection-strength:0.29] [--shade-strength:0.35] [--shade-falloff:76%] [--rim-strength:0.2] [--rim-falloff:19%] [--warm-position:82%] [--warm-strength:0.08] [--shard-shadow:0.23] [--shard-rim:0.2]",
  "[clip-path:polygon(65%_65%,100%_75%,100%_100%,50%_100%)] [background:linear-gradient(var(--glass-light-angle),rgba(243,184,63,0.18)_0%,rgba(243,184,63,0.045)_100%)] [--sx:110px] [--sy:100px] [--sr:-20deg] [--sd:50ms] [--reflection-position:57%] [--reflection-width:1.8%] [--reflection-strength:0.25] [--shade-strength:0.45] [--shade-falloff:63%] [--rim-strength:0.17] [--rim-falloff:16%] [--warm-position:91%] [--warm-strength:0.075] [--shard-shadow:0.33] [--shard-rim:0.17]",
  "[clip-path:polygon(55%_30%,80%_40%,45%_50%)] [background:linear-gradient(var(--glass-light-angle),rgba(255,201,90,0.26)_0%,rgba(243,184,63,0.075)_100%)] [--sx:50px] [--sy:-30px] [--sr:60deg] [--sd:70ms] [--reflection-position:22%] [--reflection-width:3.2%] [--reflection-strength:0.4] [--shade-strength:0.28] [--shade-falloff:82%] [--rim-strength:0.24] [--rim-falloff:24%] [--warm-position:69%] [--warm-strength:0.12] [--shard-shadow:0.18] [--shard-rim:0.25]",
] as const;

const NavigationContext = createContext<NavigateWithTransition | null>(null);

export function CinematicNavigationProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const previousPathname = useRef(pathname);
  const pendingPathname = useRef<string | null>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname === previousPathname.current) return;

    previousPathname.current = pathname;

    if (!pendingPathname.current) return;

    pendingPathname.current = null;
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    setPhase("revealing");
    revealTimer.current = setTimeout(() => setPhase("idle"), 400); // Wait for reveal to finish
  }, [pathname]);

  useEffect(
    () => () => {
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    },
    []
  );

  const navigate = useCallback<NavigateWithTransition>(
    (href) => {
      if (href === pathname || phase !== "idle") return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }

      pendingPathname.current = href.split(/[?#]/, 1)[0];
      setPhase("covering");
      // Wait for shards to finish arriving (280ms delay + 380ms duration = 660ms)
      navigationTimer.current = setTimeout(() => router.push(href), 680);
    },
    [pathname, phase, router]
  );

  return (
    <NavigationContext.Provider value={navigate}>
      {children}
      {phase !== "idle" && (
        <div
          className={`fixed inset-0 z-[9999] overflow-hidden bg-[#0d111b] [--glass-light-angle:135deg] [--glass-shadow-angle:315deg] [will-change:clip-path] motion-reduce:animate-none ${phase === "covering" ? "animate-cinematic-cover" : "pointer-events-none animate-cinematic-reveal"}`}
          aria-hidden="true"
        >
          <div className="absolute inset-0">
            {GLASS_SHARDS.map((shardClassName, index) => (
              <span
                key={index}
                className={`${SHARD_BASE_CLASS} ${shardClassName} ${phase === "covering" ? "animate-cinematic-shard-arrive" : "animate-cinematic-shard-leave"}`}
              />
            ))}
          </div>
        </div>
      )}
    </NavigationContext.Provider>
  );
}

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function TransitionLink({
  href,
  onClick,
  target,
  ...props
}: TransitionLinkProps) {
  const navigate = useContext(NavigationContext);

  if (!navigate) {
    throw new Error("TransitionLink must be used inside CinematicNavigationProvider");
  }

  return (
    <Link
      {...props}
      href={href}
      target={target}
      onClick={(event) => {
        onClick?.(event);

        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          (target && target !== "_self") ||
          event.currentTarget.hasAttribute("download")
        ) {
          return;
        }

        const destination = new URL(href, window.location.href);

        if (
          destination.origin !== window.location.origin ||
          destination.pathname === window.location.pathname
        ) {
          return;
        }

        event.preventDefault();
        navigate(`${destination.pathname}${destination.search}${destination.hash}`);
      }}
    />
  );
}