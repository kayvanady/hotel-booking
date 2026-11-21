"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MdArrowForward,
  MdAttachMoney,
  MdCalendarMonth,
  MdHotel,
  MdPeople,
  MdRateReview,
  MdRefresh,
  MdTrendingUp,
} from "react-icons/md";

const initialDashboard = {
  stats: {
    hotels: 0,
    users: 0,
    bookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    revenue: 0,
    reviewsToModerate: 0,
  },
  weeklyBookings: [],
  recentBookings: [],
};

const metrics = [
  {
    key: "hotels",
    label: "Hotels",
    icon: MdHotel,
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    key: "users",
    label: "Registered guests",
    icon: MdPeople,
    color: "bg-sky-100 text-sky-700",
  },
  {
    key: "bookings",
    label: "Total bookings",
    icon: MdCalendarMonth,
    color: "bg-violet-100 text-violet-700",
  },
  {
    key: "revenue",
    label: "Confirmed revenue",
    icon: MdAttachMoney,
    color: "bg-emerald-100 text-emerald-700",
    currency: true,
  },
];

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusStyle(status) {
  if (status === "confirmed") return "bg-emerald-100 text-emerald-800";
  if (status === "cancelled") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/dashboard", {
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load dashboard data.");
        }

        setDashboard(result.dashboard);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load dashboard data.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadDashboard();
    return () => controller.abort();
  }, []);

  const maxDailyBookings = Math.max(
    1,
    ...dashboard.weeklyBookings.map((day) => day.count),
  );

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="w-14 h-14 border-2 border-amber-600 border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-rose-100 p-4 text-rose-700">
          <MdTrendingUp className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard data is unavailable
        </h1>
        <p className="mt-2 text-slate-600">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 font-semibold text-white transition hover:bg-indigo-800"
        >
          <MdRefresh className="h-5 w-5" />
          Try again
        </button>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">
            Hotel management
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            A live overview of your hotel business.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-500">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </header>

      <section
        aria-label="Business summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map(({ key, label, icon: Icon, color, currency }) => (
          <article
            key={key}
            className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  {currency
                    ? `$${formatNumber(dashboard.stats[key])}`
                    : formatNumber(dashboard.stats[key])}
                </p>
              </div>
              <span className={`rounded-xl p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Booking activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Reservations created over the last seven days
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              {formatNumber(
                dashboard.weeklyBookings.reduce(
                  (total, day) => total + day.count,
                  0,
                ),
              )}{" "}
              bookings
            </span>
          </div>

          {dashboard.weeklyBookings.length ? (
            <div className="mt-8 grid h-48 grid-cols-7 items-end gap-3 sm:gap-5">
              {dashboard.weeklyBookings.map((day) => (
                <div
                  key={day.date}
                  className="flex h-full flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs font-semibold text-slate-600">
                    {day.count}
                  </span>
                  <div className="flex h-36 w-full items-end rounded-t-lg bg-indigo-50">
                    <div
                      className="w-full rounded-t-lg bg-indigo-600 transition-all"
                      style={{
                        height: `${Math.max(
                          day.count ? 8 : 3,
                          (day.count / maxDailyBookings) * 100,
                        )}%`,
                      }}
                      role="img"
                      aria-label={`${day.count} bookings on ${formatDate(day.date)}`}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(`${day.date}T00:00:00Z`).toLocaleDateString(
                      undefined,
                      { weekday: "short", timeZone: "UTC" },
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">
              Booking activity will appear here.
            </p>
          )}
        </article>

        <article className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-bold text-slate-900">Booking overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            Current reservation statuses
          </p>

          <div className="mt-6 space-y-5">
            {[
              {
                label: "Confirmed",
                value: dashboard.stats.confirmedBookings,
                color: "bg-emerald-500",
              },
              {
                label: "Pending",
                value: dashboard.stats.pendingBookings,
                color: "bg-amber-500",
              },
              {
                label: "Cancelled",
                value: dashboard.stats.cancelledBookings,
                color: "bg-rose-500",
              },
            ].map((item) => {
              const percentage = dashboard.stats.bookings
                ? (item.value / dashboard.stats.bookings) * 100
                : 0;
              return (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-600">
                      {item.label}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${item.label} bookings`}
                    aria-valuenow={item.value}
                    aria-valuemin={0}
                    aria-valuemax={dashboard.stats.bookings}
                  >
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between rounded-xl bg-violet-50 p-4">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-violet-100 p-2 text-violet-700">
                <MdRateReview className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">
                  Reviews to review
                </p>
                <p className="text-sm text-slate-500">Awaiting moderation</p>
              </div>
            </div>
            <span className="text-xl font-bold text-violet-800">
              {formatNumber(dashboard.stats.reviewsToModerate)}
            </span>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent bookings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                The latest reservations across your hotels
              </p>
            </div>
            <Link
              href="/admin/hotels"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Hotels <MdArrowForward className="h-4 w-4" />
            </Link>
          </div>
          {dashboard.recentBookings.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-155 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Guest</th>
                    <th className="px-6 py-3 font-semibold">Hotel</th>
                    <th className="px-6 py-3 font-semibold">Check-in</th>
                    <th className="px-6 py-3 font-semibold">Amount</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboard.recentBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-indigo-50/40">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {booking.user?.name || "Guest"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {booking.hotelName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(booking.checkIn)}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        ${formatNumber(booking.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 pb-6 text-sm text-slate-500">
              No bookings yet. New reservations will show up here.
            </p>
          )}
        </article>

        <article className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-bold text-slate-900">Quick actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Jump straight to common admin tasks
          </p>
          <div className="mt-5 space-y-3">
            {[
              {
                href: "/admin/hotels/add",
                title: "Add a hotel",
                description: "List a new property and its rooms",
                icon: MdHotel,
                color: "bg-indigo-100 text-indigo-700",
              },
              {
                href: "/admin/users",
                title: "Manage guests",
                description: "View and manage user accounts",
                icon: MdPeople,
                color: "bg-sky-100 text-sky-700",
              },
              {
                href: "/admin/comments",
                title: "Review comments",
                description: "Moderate guest feedback",
                icon: MdRateReview,
                color: "bg-violet-100 text-violet-700",
              },
            ].map(({ href, title, description, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/60"
              >
                <span className={`rounded-lg p-2.5 ${color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-800">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-500">
                    {description}
                  </span>
                </span>
                <MdArrowForward className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-700" />
              </Link>
            ))}
          </div>
        </article>
      </section>
      <footer className="border-t border-indigo-200/70 pt-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Hotel Admin Panel. All rights reserved.
      </footer>
    </div>
  );
}
