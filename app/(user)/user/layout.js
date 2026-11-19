"use client";
import { useAuth } from "@/context/Auth";
import Link from "next/link";
import { useState } from "react";
import {
  MdClose,
  MdMenu,
  MdDashboard,
  MdHotel,
  MdLogout,
} from "react-icons/md";

export default function UserLayout({ children }) {
  const [sidebar, setSidebar] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="h-screen flex overflow-hidden">
      <aside
        className={`w-64 z-40 fixed left-0 p-4 inset-y-0  bg-linear-to-b from-indigo-200 via-purple-100 to-pink-100 border-white/60 flex flex-col gap3 lg:relative transition-transform duration-300 ease-in-out lg:translate-0
            ${sidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        <h1 className="text-2xl font-bold text-indigo-900 mb-2.5">
          User <span className="text-purple-800">Panel</span>
        </h1>

        <Link
          href="/user/profile"
          className="flex p-3 font-medium transition-all duration-200  hover:shadow-sm text-gray-800 cursor-pointer items-center gap-3 hover:bg-white/40 rounded-xl "
        >
          <MdDashboard className="w-5 h-5 shrink-0" /> Profile
        </Link>
        <Link
          href="/user/hotels"
          className="flex p-3 font-medium transition-all duration-200  hover:shadow-sm text-gray-800 cursor-pointer items-center gap-3 hover:bg-white/40 rounded-xl "
        >
          <MdHotel className="w-5 h-5 shrink-0" /> Hotels
        </Link>
        <Link
          href="/user/mylist"
          className="flex p-3 font-medium transition-all duration-200  hover:shadow-sm text-gray-800 cursor-pointer items-center gap-3 hover:bg-white/40 rounded-xl "
        >
          <MdMenu className="w-5 h-5 shrink-0" /> My List
        </Link>
        <button
          onClick={logout}
          className="flex p-3 transition-all duration-200 mt-auto  hover:shadow-sm  font-medium text-red-700 cursor-pointer items-center gap-3 hover:text-red-800 rounded-xl "
        >
          <MdLogout className="w-5 h-5 shrink-0" /> Logout
        </button>
      </aside>
      {sidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebar((prev) => !prev)}
        ></div>
      )}
      <main className="flex-1">
        <button
          onClick={() => setSidebar((prev) => !prev)}
          className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-indigo-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebar ? (
            <MdClose className="w-5 h-5 text-indigo-800" />
          ) : (
            <MdMenu className="w-5 h-5 text-indigo-800" />
          )}
        </button>
        <div className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
