"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaMapMarkerAlt, FaStar } from "react-icons/fa";

export default function Latest() {
  const { data, isLoading } = useQuery({
    queryKey: ["latestHotels"],
    queryFn: async () => {
      const res = await fetch("/api/hotels/hotel/latest");
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    },
  });

  const hotels = data?.hotels || [];

  const lowestPrice = (hotel) => {
    const lowest = Math.min(...hotel.rooms.map((room) => room.price));
    return lowest;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-64 w-full animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        {hotels.map((hotel) => (
          <div
            key={hotel._id}
            className="rounded-4xl overflow-hidden shadow-2xl group"
          >
            <div className="h-[60%] relative overflow-hidden ">
              <img
                src={hotel.thumbnail}
                alt={hotel.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/10 to-transparent" />
              <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900 backdrop-blur-sm">
                <FaStar className="text-amber-500" />
                {hotel.stars}
              </div>
            </div>
            <div className=" px-2.5 pt-4 pb-8 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl text-slate-900 font-bold">
                  {hotel.name}
                </h2>
                <div className="flex flex-col justify-center items-center gap-0.5">
                  <span className="text-sm  text-gray-400 uppercase tracking-wider">
                    From
                  </span>
                  <p className="text-2xl text-slate-900 font-bold">
                    ${lowestPrice(hotel)}
                  </p>
                </div>
              </div>
              <div className="flex  items-center gap-1 text-slate-500 text-sm font-semibold">
                <FaMapMarkerAlt className="text-amber-600" />
                {hotel.address.city}
              </div>

              <Link
                href={`/hotel/city/${hotel.address.city}`}
                className="mt-4 mb-6 flex w-fit items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                View details
                <FaArrowRight />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
