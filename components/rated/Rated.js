"use client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export default function Rated() {
  const { data, isLoading } = useQuery({
    queryKey: ["rated"],
    queryFn: async () => {
      const res = await fetch("/api/hotels/hotel/rated");
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    },
  });

  const hotels = data?.hotels || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hotels.map((hotel) => (
          <Link
            href={`/hotel/${hotel._id}`}
            key={hotel._id}
            className="rounded-4xl overflow-hidden group shadow relative group cursor-pointer h-64"
          >
            <Image
              src={hotel.thumbnail}
              alt={hotel.name}
              fill
              quality={100}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-2xl font-bold">{hotel.name}</h4>
                <span className="rounded-full border border-white/40 bg-white/10 px-2 py-1 text-xs font-medium uppercase tracking-[0.2em] backdrop-blur-sm">
                  city
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
