"use client";
import Link from "next/link";

export default function Header() {
  const cities = [
    { name: "Tehran", href: "Tehran" },
    { name: "Shiraz", href: "Shiraz" },
    { name: "New York", href: "New York" },
    { name: "Hamburg", href: "Hamburg" },
    { name: "Barcelona", href: "Barcelona" },
  ];
  return (
    <header className="bg-[url('/images/slider.jpg')] bg-cover bg-no-repeat min-h-150 bg-center w-full   z-1 relative">
      <div className="bg-black/30 absolute inset-0  w-full h-full" />
      <div className="container flex-col z-10   mx-auto">
        <div className="z-10 flex flex-col justify-center items-center gap-8 mt-10">
          <p className="text-sm text-white/80 tracking-wider z-10 ">
            FIND YOUR PERFECT STAY
          </p>
          <h2 className="z-10 text-center text-5xl text-white font-bold leading-tight tracking-tight">
            Book Every Hotel, <br /> Anywhere, Anytime
          </h2>
          <p className="text-sm text-white/85 tracking-wide leading-7 z-10 le text-center">
            Discover beautiful hotels, comfortable rooms,and unforgettable stays{" "}
            <br /> around the world
          </p>
          <Link
            href="/hotel"
            className="mt-4 z-10 rounded-full bg-white px-8 py-3 font-semibold text-gray-900 shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-gray-100"
          >
            Explore Hotels
          </Link>
        </div>
        <div className="my-12 flex flex-wrap justify-center gap-3">
          {cities.map((city, index) => (
            <Link
              key={index}
              href={`/hotel/city/${encodeURIComponent(city.href)}`}
              className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-md transition duration-300 hover:bg-white hover:text-gray-900"
            >
              {city.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
