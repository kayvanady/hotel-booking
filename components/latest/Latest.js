"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FaArrowRight, FaMapMarkerAlt, FaStar } from "react-icons/fa";

export default function Latest() {
  const { data, isLoading } = useQuery({
    queryKey: ["latestHotels"],
    queryFn: async () => {
      const res = await fetch("/api/hotels/hotel/latest");
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });

  const hotels = data?.hotels || [];

  const lowestPrice = (hotel) => {
    const prices = hotel.rooms?.map((room) => room.price) || [];
    return prices.length ? Math.min(...prices) : hotel.price;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-100 w-full animate-pulse rounded-3xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {hotels.map((hotel) => {
        const price = lowestPrice(hotel);

        return (
          <article
            key={hotel._id}
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
          >
            <div className="relative h-56 shrink-0 overflow-hidden bg-slate-200">
              <img
                src={hotel.thumbnail}
                alt={hotel.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent" />

              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-sm font-bold text-slate-800 shadow-sm backdrop-blur">
                <FaStar className="text-amber-500" />
                {hotel.stars}
              </div>

              <div className="absolute bottom-4 left-4">
                <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  Latest stay
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h2 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-amber-600">
                {hotel.name}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <FaMapMarkerAlt className="shrink-0 text-amber-500" />
                <span className="truncate">{hotel.address?.city}</span>
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                {hotel.shortDescription}
              </p>

              <div className="my-5 border-t border-slate-100" />

              <div className="mt-auto flex items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Starting from
                  </span>

                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {price != null ? `$${price}` : "N/A"}
                  </p>
                </div>

                <Link
                  href={`/hotel/city/${encodeURIComponent(hotel.address?.city || "")}`}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-amber-500"
                >
                  Details
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
