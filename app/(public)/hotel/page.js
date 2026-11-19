"use client";

import useDebounce from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { FaArrowRight, FaMapMarkerAlt, FaStar, FaSearch } from "react-icons/fa";

export default function Page() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hotels", debouncedSearch],
    queryFn: async () => {
      const res = await fetch(
        `/api/hotels?search=${encodeURIComponent(debouncedSearch)}`,
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data;
    },
  });

  const hotels = data?.hotels || [];

  const lowestPrice = (hotel) => {
    if (!hotel.rooms?.length) return null;

    return Math.min(...hotel.rooms.map((room) => room.price));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-3 block text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
            Find your perfect escape
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Explore your best stay
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Discover amazing places and enjoy unforgettable experiences.
          </p>
        </div>

        <div className="relative w-full md:max-w-sm">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hotels, cities..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
          />
        </div>
      </div>

      
      {isLoading && (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="h-56 animate-pulse bg-slate-200" />

              <div className="space-y-4 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-100" />

                <div className="flex items-center justify-between pt-3">
                  <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {!isLoading && isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-600">
            Something went wrong while loading hotels.
          </p>
        </div>
      )}

      
      {!isLoading && !isError && hotels.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-800">No hotels found</h2>
          <p className="mt-2 text-sm text-slate-500">
            Try searching for another hotel or destination.
          </p>
        </div>
      )}

      
      {!isLoading && !isError && hotels.length > 0 && (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hotels.map((hotel) => {
            const price = lowestPrice(hotel);

            return (
              <article
                key={hotel._id}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
               
                <div className="relative h-56 overflow-hidden">
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
                      Featured stay
                    </span>
                  </div>
                </div>

                
                <div className="p-5">
                  <h2 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-amber-600">
                    {hotel.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <FaMapMarkerAlt className="shrink-0 text-amber-500" />
                    <span className="truncate">{hotel.address?.city}</span>
                  </div>

                  <div className="my-5 border-t border-slate-100" />

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                        Starting from
                      </span>

                      <p className="mt-1 text-2xl font-extrabold text-slate-900">
                        {price !== null ? `$${price}` : "N/A"}
                      </p>
                    </div>

                    <Link
                      href={`/hotel/${hotel._id}`}
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
      )}
    </section>
  );
}
