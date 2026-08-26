"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { MenuIcon, XIcon } from "lucide-react";
import { ThemeToggle } from "@components/theme-toggle";
import { duration, ease } from "@styles/motion";
import styles from "./site-nav.module.scss";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/cv", label: "CV" },
  { href: "/contact", label: "Contact" },
];

const SCROLL_THRESHOLD = 64;

export function SiteNav({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuClosedForPathname, setMenuClosedForPathname] = useState(pathname);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu on route change — covers navigations that don't go
  // through the explicit onClick below (e.g. browser back/forward). Adjusting
  // state during render (not in an effect) per React's guidance for "reset
  // state when a prop changes" avoids an extra cascading render.
  if (pathname !== menuClosedForPathname) {
    setMenuClosedForPathname(pathname);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  function renderLinks(onLinkClick?: () => void) {
    return links.map((link) => {
      const isActive = pathname.startsWith(link.href);

      return (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive ? "page" : undefined}
          className={isActive ? styles.linkActive : styles.link}
          onClick={onLinkClick}
        >
          {link.label}
        </Link>
      );
    });
  }

  return (
    <nav className={`${styles.nav} ${isScrolled ? styles.scrolled : ""}`}>
      <Link href="/" className={styles.brand}>
        {siteName}
      </Link>
      <div className={styles.right}>
        <div className={styles.links}>{renderLinks()}</div>
        <ThemeToggle />
        <button
          ref={menuTriggerRef}
          type="button"
          className={styles.menuTrigger}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? (
            <XIcon aria-hidden="true" />
          ) : (
            <MenuIcon aria-hidden="true" />
          )}
        </button>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <m.div
            id="mobile-menu"
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: duration.fast, ease: ease.out }}
          >
            {renderLinks(() => setIsMenuOpen(false))}
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
