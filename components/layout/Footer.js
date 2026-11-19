import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function Footer() {
  return (
    <>
      <footer className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-slate-950">
                L
              </span>
              LuxeStay
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
              Find a place that feels like part of the journey. Discover
              handpicked stays and make every trip memorable.
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Stays worth remembering
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Explore
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li>
                <Link className="transition hover:text-amber-300" href="/">
                  All stays
                </Link>
              </li>
              <li>
                <Link
                  className="transition hover:text-amber-300"
                  href="/hotel/city/Tehran"
                >
                  Tehran
                </Link>
              </li>
              <li>
                <Link
                  className="transition hover:text-amber-300"
                  href="/hotel/city/Shiraz"
                >
                  Shiraz
                </Link>
              </li>
              <li>
                <Link
                  className="transition hover:text-amber-300"
                  href="/hotel/city/Barcelona"
                >
                  Barcelona
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Your trip
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li>
                <Link className="transition hover:text-amber-300" href="/cart">
                  Your booking cart
                </Link>
              </li>
              <li>
                <Link
                  className="transition hover:text-amber-300"
                  href="/auth/login"
                >
                  Sign in or register
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-lg font-semibold">Your next stay starts here.</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Browse inspiring stays and find the right place for your next
              getaway.
            </p>
            <Link
              href="/hotel"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Explore stays
              <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <p>© LuxeStay. All rights reserved.</p>
            <p>Travel well. Stay somewhere special.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
