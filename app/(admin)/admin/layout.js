"use client";

import { useAuth } from "@/context/Auth";
import Link from "next/link";
import { useState } from "react";
import {
  MdDashboard,
  MdPeople,
  MdHotel,
  MdAdd,
  MdComment,
  MdLogout,
  MdClose,
  MdMenu,
} from "react-icons/md";

export default function AdminLayout({ children }) {
  const [sidebar, setSidebar] = useState(false);
  const {logout} = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100">
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          bg-linear-to-b from-indigo-200 via-purple-100 to-pink-100
          shadow-2xl lg:shadow-none
          border-r border-white/60
          flex flex-col gap-1 p-4
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <h1 className="text-2xl font-extrabold text-indigo-900 mb-4 px-2">
          Admin<span className="text-purple-800">Panel</span>
        </h1>

        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-sm"
        >
          <MdDashboard className="w-5 h-5 shrink-0" />
          Dashboard
        </Link>

        <Link
          href="/admin/users"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-sm"
        >
          <MdPeople className="w-5 h-5 shrink-0" />
          Users
        </Link>

        <Link
          href="/admin/hotels"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-sm"
        >
          <MdHotel className="w-5 h-5 shrink-0" />
          Hotels
        </Link>

        <Link
          href="/admin/hotels/add"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-sm"
        >
          <MdAdd className="w-5 h-5 shrink-0" />
          Add Hotel
        </Link>

        <Link
          href="/admin/comments"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-white/40 hover:shadow-sm"
        >
          <MdComment className="w-5 h-5 shrink-0" />
          Comments
        </Link>

        <div className="flex-1" />

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer font-medium transition-all duration-200  hover:shadow-sm w-full text-left text-red-700 hover:bg-red-100/80 hover:text-red-800"
        >
          <MdLogout className="w-5 h-5 shrink-0" />
          Log out
        </button>
      </aside>

      {sidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      <main className="relative flex-1 flex flex-col">
        <button
          onClick={() => setSidebar(!sidebar)}
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
