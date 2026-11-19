"use client";

import { useAuth } from "@/context/Auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function UserHotels() {
  const { user } = useAuth();

  const userHotels = useQuery({
    queryKey: ["userHotels"],
    queryFn: async () => {
      const res = await fetch("/api/user/hotelList");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error("Failed to fetch user hotels");
      }

      return data.bookings;
    },
    enabled: !!user,
  });

  const cancellMu = useMutation({
    mutationFn: async (bookingId) => {
      const res = await fetch(`/api/booking/cancelation/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data.booking;
    },
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCancellation = (bookingId) => {
    cancellMu.mutate(bookingId, {
      onSuccess: () => {
        userHotels.refetch();
      },
    });
  };

  return (
    <div className="min-h-screen  px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage and view your reserved rooms.
            </p>
          </div>

          <Link
            href="/hotel"
            className="w-fit rounded-xl border border-gray-200  px-5 py-3 text-sm font-semibold text-gray-600 transition duration-200 hover:bg-amber-600 hover:text-white"
          >
            Explore Hotels
          </Link>
        </div>

        {userHotels.isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        )}

        {userHotels.isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-600">
              {userHotels.error.message}
            </p>
          </div>
        )}

        {userHotels.isSuccess && userHotels.data?.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">No Bookings Yet</h2>

            <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
              You haven't reserved any rooms yet. Explore our hotels and find
              the perfect room for your next stay.
            </p>

            <Link
              href="/hotel"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Browse Hotels
            </Link>
          </div>
        )}

        {userHotels.isSuccess && userHotels.data?.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {userHotels.data.map((booking) => (
              <div
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Reservation ID
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      #{booking._id.slice(-8)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {booking.hotelName}
                      </h2>

                      <p className="text-sm text-gray-500">
                        Room Number: {booking.roomNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
                    <div>
                      <p className="text-xs text-gray-400">Check-in</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {new Date(booking.checkIn).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Check-out</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {new Date(booking.checkOut).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Guests</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {booking.guests} Guests
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Total Price</p>
                      <p className="mt-1 text-sm font-bold text-indigo-600">
                        ${booking.totalPrice}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <Link
                      href={`/hotel/${booking.hotel}/${booking.roomId}`}
                      className="w-fit rounded-xl border border-gray-200  px-5 py-3 text-sm font-semibold text-gray-600 transition duration-200 hover:bg-amber-600 hover:text-white"
                    >
                      View Room
                    </Link>

                    {booking.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancellation(booking._id)}
                        type="button"
                        className="rounded-lg border cursor-pointer border-gray-200 px-4 duration-300 py-2 text-sm font-semibold text-gray-400 transition hover:bg-red-600 hover:text-white"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
