"use client";

import { useAuth } from "@/context/Auth";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { CiFaceSmile, CiShoppingCart, CiUser } from "react-icons/ci";

export default function PublicNav() {
  const { user } = useAuth();
  const { roomCart } = useCart();
  const dashboardHref =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "user"
        ? "/user/profile"
        : "/auth/login";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-b-black/10  bg-cyan-800/60 text-white  backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-bold text-white"
        >
          LuxeStay
          <CiFaceSmile size={28} />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={dashboardHref}
            aria-label={user ? "Open dashboard" : "Login or register"}
            className="flex items-center justify-center rounded-full px-3 py-2 text-sm text-white transition hover:bg-white/15"
          >
            {user ? <CiUser size={24} /> : "Login / Register"}
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart${roomCart.length ? `, ${roomCart.length} items` : ""}`}
            className="relative flex items-center justify-center rounded-full px-3 py-2 text-white transition hover:bg-white/15"
          >
            {roomCart.length > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs text-white">
                {roomCart.length}
              </span>
            )}
            <CiShoppingCart size={28} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
