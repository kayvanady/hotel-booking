"use client";
import Latest from "@/components/latest/Latest";
import Header from "@/components/layout/Header";
import Rated from "@/components/rated/Rated";
import CommentsSlider from "@/components/swiper/Swiper";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaMagic,
  FaPlus,
  FaShieldAlt,
  FaWifi,
} from "react-icons/fa";

export default function Hi() {
  const [timer, setTimer] = useState(44640);
  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timer / 3600);
  const mins = Math.floor((timer % 3600) / 60);
  const secs = timer % 60;

  return (
    <>
      <Header />

      <section className=" py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-gray-300 bg-white/90 p-6 shadow md:grid-cols-4 md:p-8">
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gray-300 bg-gray-50 px-6 py-8 text-center transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                <span>120</span>
                <FaPlus size={18} className="text-[#b68a5a]" />
              </p>
              <span className="text-sm text-gray-500">Cities Covered</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gray-300 bg-gray-50 px-6 py-8 text-center transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                <span>18K</span>
                <FaPlus size={18} className="text-[#b68a5a]" />
              </p>
              <span className="text-sm text-gray-500">Happy guests</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gray-300 bg-gray-50 px-6 py-8 text-center transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="text-2xl font-bold text-gray-900">4.8/5</p>
              <span className="text-sm text-gray-500">Average review</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gray-300 bg-gray-50 px-6 py-8 text-center transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="text-2xl font-bold text-gray-900">24/7</p>
              <span className="text-sm text-gray-500">Trip support</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <h2 className="text-amber-600 uppercase tracking-[0.25rem] text-sm font-semibold">
            why book with us
          </h2>
          <div className="flex justify-between items-center my-6">
            <p className="text-4xl font-bold text-slate-900 ">
              Designed for easier, better travel
            </p>
            <Link
              href="/hotel"
              className="flex items-center justify-center gap-1 text-slate-900 font-semibold text-sm"
            >
              <p>explore all hotels</p>
              <FaArrowRight />
            </Link>
          </div>
          <div className="grid  grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-300 bg-white/90 rounded-2xl shadow px-8 py-6 flex flex-col justify-baseline gap-4">
              <span className="bg-amber-100 h-10 text-amber-600 w-10 rounded-xl inline-flex justify-center items-center">
                <FaShieldAlt />
              </span>
              <p className="text-2xl font-bold text-slate-900">
                Secure booking
              </p>
              <p className="text-sm font-semibold text-gray-400">
                Instant confirmation and trusted stays backed by round-the-clock
                support.
              </p>
            </div>
            <div className="border border-gray-300 bg-white/90  rounded-2xl shadow px-8 py-6 flex flex-col justify-baseline gap-4">
              <span className="bg-amber-100 h-10 text-amber-600 w-10 rounded-xl inline-flex justify-center items-center">
                <FaWifi />
              </span>
              <p className="text-2xl font-bold text-slate-900">Free Wi-Fi</p>
              <p className="text-sm font-semibold text-gray-400">
                Stay connected with fast internet in every room and lounge area.
              </p>
            </div>
            <div className="border border-gray-300 bg-white/90  rounded-2xl shadow px-8 py-6 flex flex-col justify-baseline gap-4">
              <span className="bg-amber-100 h-10 text-amber-600 w-10 rounded-xl inline-flex justify-center items-center">
                <FaMagic />
              </span>
              <p className="text-2xl font-bold text-slate-900">Curated stays</p>
              <p className="text-sm font-semibold text-gray-400">
                Discover handpicked boutique hotels and resort-style escapes for
                every mood.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50 ">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="uppercase tracking-[0.25rem] text-amber-500">
            featured stays
          </h2>
          <p className="text-4xl text-slate-900 font-bold my-8">
            Handpicked hotels for your next escape
          </p>
          <div>
            <Latest />
          </div>
        </div>
      </section>

      <section className="py-22">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
              5 star hotels
            </p>
            <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Discover cities worth staying in
            </h3>
          </div>
          <Rated />
        </div>
      </section>

      <section className="bg-slate-900 py-14 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
              Limited time offer
            </p>
            <h3 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Save up to 30% on luxury getaways
            </h3>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Enjoy complimentary breakfast, free cancellation, and exclusive
              member perks when you book selected stays before the end of the
              month.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                View offers
              </Link>
              <Link
                href="/"
                className="rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Talk to concierge
              </Link>
            </div>
          </div>

          <div className="rounded-4xl bg-linear-to-br from-amber-400 via-orange-400 to-rose-400 p-6 text-slate-900 shadow-[0_30px_60px_rgba(251,146,60,0.35)]">
            <div className="rounded-3xl bg-white/20 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.2em] text-slate-800/80">
                <span>Member deal</span>
                <span>Ends soon</span>
              </div>
              <div className="mt-6 text-5xl font-black">30%</div>
              <p className="mt-3 text-lg font-medium text-slate-800">
                On selected 3-night stays across Europe and the Middle East.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/35 p-3 text-center">
                  <div className="text-2xl font-black">{hours}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-800/80"></div>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 text-center">
                  <div className="text-2xl font-black">{mins}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-800/80"></div>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 text-center">
                  <div className="text-2xl font-black">{secs}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-800/80"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">What Our Customers Say</h2>

            <p className="mt-3 text-gray-500">
              Real experiences from our users
            </p>
          </div>

          <CommentsSlider />
        </div>
      </section>
    </>
  );
}
