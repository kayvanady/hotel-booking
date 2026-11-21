
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
      {hotels.map((hotel) => (
        <div
          key={hotel._id}
          className="flex flex-col h-full overflow-hidden rounded-3xl bg-gray-50 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl group"
        >
          <div className="relative h-56 w-full shrink-0 overflow-hidden bg-slate-200">
            <img
              src={hotel.thumbnail}
              alt={hotel.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-transparent to-transparent pointer-events-none" />

            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900 backdrop-blur-sm">
              <FaStar className="text-amber-500" />
              {hotel.stars}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div className="flex justify-between items-start gap-2">
              <h2 className="text-lg text-slate-900 font-bold line-clamp-2">
                {hotel.name}
              </h2>

              <div className="flex shrink-0 flex-col items-end">
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  From
                </span>
                <p className="text-xl text-slate-900 font-bold">
                  ${lowestPrice(hotel)}
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1 text-slate-500 text-sm font-semibold">
              <FaMapMarkerAlt className="text-amber-600" />
              {hotel.address?.city}
            </div>

            <p className="mt-3 text-sm text-gray-500 leading-6 line-clamp-2">
              {hotel.shortDescription}
            </p>

            <Link
              href={`/hotel/city/${encodeURIComponent(hotel.address?.city || "")}`}
              className="mt-auto pt-5 flex w-fit items-center gap-2"
            >
              <span className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                View details
              </span>
              <FaArrowRight className="text-slate-900" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
