"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";

export default function Booking({ roomId, hotelId, onBookingChange }) {
  const [range, setRange] = useState();

  const checkIn = range?.from ? format(range.from, "yyyy-MM-dd") : "";
  const checkOut = range?.to ? format(range.to, "yyyy-MM-dd") : "";

  const validRange = range?.from && range?.to && range.from < range.to;

  const availabilityQuery = useQuery({
    queryKey: ["availability", roomId, hotelId, checkIn, checkOut],
    enabled: Boolean(validRange),
    queryFn: async () => {
      const res = await fetch(
        `/api/booking/availability?hotelId=${hotelId}&roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }
      return data;
    },
  });

  useEffect(() => {
    const isAvailable =
      validRange &&
      !availabilityQuery.isFetching &&
      availabilityQuery.isSuccess &&
      availabilityQuery.data?.available === true;

    if (!isAvailable) {
      onBookingChange(null);
      return;
    }

    onBookingChange({
      checkIn,
      checkOut,
      nights: availabilityQuery?.data.nights,
      pricePerNight: availabilityQuery.data.pricePerNight,
      totalPrice: availabilityQuery.data.totalPrice,
    });
  }, [
    validRange,
    checkIn,
    checkOut,
    availabilityQuery.isSuccess,
    availabilityQuery.isFetching,
    availabilityQuery.data,
    onBookingChange,
  ]);

  return (
    <section className="mt-6 rounded-xl border border-gray-200 p-5">
      <h2 className="mb-4 text-xl font-semibold">Choose your stay</h2>

      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        disabled={[
          { before: new Date() },
          ...(range?.from ? [{ before: addDays(range.from, 1) }] : []),
        ]}
        numberOfMonths={1}
      />

      <div className="mt-4 space-y-2 text-sm">
        <p>Check-in: {checkIn || "Select a date"}</p>

        <p>Check-out: {checkOut || "Select a date"}</p>
      </div>

      {availabilityQuery.isFetching && (
        <p className="mt-4 text-gray-500">Checking availability...</p>
      )}

      {availabilityQuery.isError && (
        <p className="mt-4 text-red-600">{availabilityQuery.error.message}</p>
      )}

      {availabilityQuery.data?.available === true && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-800">
          <p>Room is available!</p>
          <p>Nights: {availabilityQuery.data.nights}</p>
          <p>Price per night: {availabilityQuery.data.pricePerNight}</p>
          <p>Total: {availabilityQuery.data.totalPrice}</p>
        </div>
      )}

      {availabilityQuery.data?.available === false && (
        <p className="mt-4 text-red-600">{availabilityQuery.data.message}</p>
      )}
    </section>
  );
}
