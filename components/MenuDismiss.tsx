"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** The phone menu is a native <details>; this closes it on a tap outside it, on Escape and after a page change. */
export default function MenuDismiss() {
  const path = usePathname();
  useEffect(() => {
    const menu = () => document.querySelector<HTMLDetailsElement>(".nav-menu");
    menu()?.removeAttribute("open");
    const away = (e: PointerEvent) => { const m = menu(); if (m?.open && !m.contains(e.target as Node)) m.open = false; };
    const esc = (e: KeyboardEvent) => { const m = menu(); if (e.key === "Escape" && m?.open) m.open = false; };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [path]);
  return null;
}
