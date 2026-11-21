"use client";

import { useQuery } from "@tanstack/react-query";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function CommentsSlider() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["comments"],
    queryFn: async () => {
      const res = await fetch("/api/comments");

      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }

      return res.json();
    },
  });

  const comments = data?.comments || [];

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

  if (isError) {
    return <p className="py-10 text-center">Failed to load comments.</p>;
  }

  if (comments.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">What Our Customers Say</h2>

          <p className="mt-3 text-gray-500">Real experiences from our users</p>
        </div>

        <Swiper
          modules={[Pagination, FreeMode]}
          spaceBetween={20}
          slidesPerView={4}
          slidesPerGroup={4}
          grabCursor={true}
          freeMode={false}
          pagination={{
            clickable: true,
          }}
          className="comments-swiper"
          breakpoints={{
            320: {
              slidesPerView: 1,
              slidesPerGroup: 1,
            },
            640: {
              slidesPerView: 2,
              slidesPerGroup: 2,
            },
            1024: {
              slidesPerView: 4,
              slidesPerGroup: 4,
            },
          }}
        >
          {comments.map((comment) => (
            <SwiperSlide key={comment._id}>
              <div className="group flex h-64 flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl font-serif leading-none text-blue-600">
                    "
                  </span>

                  <div className="flex gap-1 text-sm text-amber-400">★★★★★</div>
                </div>

                <p className="flex-1 overflow-hidden text-sm leading-7 text-gray-600">
                  {comment.text}
                </p>

                <div className="my-4 h-px w-full bg-gray-100" />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                    {(comment.user?.name || "A").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {comment.user?.name || "Anonymous"}
                    </h3>

                    <p className="text-xs text-gray-400">Verified reviewer</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
