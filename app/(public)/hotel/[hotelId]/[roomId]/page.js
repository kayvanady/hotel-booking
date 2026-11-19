"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { PiTrash } from "react-icons/pi";
import { toast } from "react-toastify";

import { useCart } from "@/context/CartContext";
import { useFavorite } from "@/context/FavoriteContext";
import Booking from "@/components/layout/Booking";
import { useCallback, useState } from "react";
import CommentSection from "@/components/commentSection/CommentSection";

export default function RoomPage() {
  const params = useParams();
  const hotelId = params?.hotelId;
  const roomId = params?.roomId;

  const [bookingInfo, setBookingInfo] = useState(null);

  const handleBookingChange = useCallback((info) => {
    setBookingInfo(info);
  });

  const { roomCart, addToCart, removeCart } = useCart();

  const { favorite = [], addFavorite, removeFavorite } = useFavorite();

  const { data, isLoading, error } = useQuery({
    queryKey: ["room", hotelId, roomId],
    enabled: Boolean(hotelId && roomId),

    queryFn: async () => {
      const res = await fetch(`/api/hotels/hotel/${hotelId}/${roomId}`);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch room data");
      }

      return result;
    },
  });

  const hotel = data?.hotel;
  const room = data?.room;

  const comments = useQuery({
    queryKey: ["comments"],
    queryFn: async () => {
      const res = await fetch(`/api/comments/${roomId}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error("somthing went wrong");
      }

      return data;
    },
    enabled: !!roomId,
  });

  const isFavorite = roomId
    ? favorite.some((item) => item._id === roomId)
    : false;

  const cartItem = bookingInfo
    ? roomCart.find(
        (item) =>
          item.roomId === String(roomId) &&
          item.checkIn === bookingInfo.checkIn &&
          item.checkOut === bookingInfo.checkOut,
      )
    : null;

  const isRoomInCart = Boolean(cartItem);

  const handleToggleFavorite = () => {
    if (!room) return;

    if (isFavorite) {
      removeFavorite(roomId);
      toast.success("Removed from favorites");
    } else {
      addFavorite(room);
      toast.success("Added to favorites");
    }
  };

  const handleAddToCart = () => {
    if (!room || !room.isAvailable) {
      toast.error("This room is unavailable");
      return;
    }

    if (isRoomInCart) {
      toast.info("This room is already in your cart");
      return;
    }

    addToCart({
      hotelId: String(hotelId),
      roomId: String(room._id),
      hotelName: hotel.name,
      roomNumber: room.roomNumber,
      roomType: room.type,
      roomThumbnail: hotel.thumbnail,

      checkIn: bookingInfo.checkIn,
      checkOut: bookingInfo.checkOut,
      guests: 2,
      nights: bookingInfo.nights,
      pricePerNight: bookingInfo.pricePerNight,
      totalPrice: bookingInfo.totalPrice,
    });

    toast.success("Room added to cart");
  };

  const handleRemoveFromCart = () => {
    if (!cartItem) return;

    removeCart(cartItem.cartItemId);
    toast.success("Booking removed from cart");
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">
            Loading room details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !hotel || !room) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            {error ? "Something went wrong" : "Room not found"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error
              ? error.message
              : "The room you're looking for doesn't exist."}
          </p>

          <Link
            href={hotelId ? `/hotel/${hotelId}` : "/"}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Back to Hotel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-amber-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500"
        >
          <Link
            href={`/hotel/${hotelId}`}
            className="transition hover:text-amber-600"
          >
            {hotel.name}
          </Link>

          <span aria-hidden="true">/</span>

          <span className="font-medium capitalize text-slate-800">
            {room.type} Room
          </span>
        </nav>

        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl shadow-slate-200/50">
          <div className="relative h-64 overflow-hidden bg-slate-200 sm:h-80 lg:h-105">
            <img
              src={hotel.thumbnail || "/images/slider.jpg"}
              alt={`${hotel.name} ${room.type} room`}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/10" />

            <span
              className={`absolute left-4 top-4 rounded-full px-4 py-2 text-xs font-bold shadow-sm sm:left-6 sm:top-6 sm:text-sm ${
                room.isAvailable
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {room.isAvailable ? "Available" : "Unavailable"}
            </span>

            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              aria-pressed={isFavorite}
              className={`absolute cursor-pointer right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-105 sm:right-6 sm:top-6 ${
                isFavorite
                  ? "text-red-500"
                  : "text-slate-500 hover:text-red-500"
              }`}
            >
              {isFavorite ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
            </button>

            <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-7 sm:left-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 sm:text-sm">
                {hotel.name}
              </p>

              <h1 className="mt-2 text-3xl font-bold capitalize drop-shadow-sm sm:text-4xl lg:text-5xl">
                {room.type} Room
              </h1>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-5 border-b border-slate-100 pb-7 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm text-slate-500">Room number</p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {room.roomNumber}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Comfortable accommodation at {hotel.name}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 px-5 py-4 sm:min-w-40 sm:text-right">
                <p className="text-sm font-medium text-amber-800">
                  Price per night
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  ${room.price}
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-amber-200">
                <p className="text-sm text-slate-500">Room Type</p>
                <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
                  {room.type}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-amber-200">
                <p className="text-sm text-slate-500">Capacity</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {room.capacity} Guests
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-amber-200">
                <p className="text-sm text-slate-500">Room Number</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {room.roomNumber}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-amber-200">
                <p className="text-sm text-slate-500">Availability</p>
                <p
                  className={`mt-2 text-lg font-semibold ${
                    room.isAvailable ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {room.isAvailable ? "Available" : "Unavailable"}
                </p>
              </div>
            </div>

            <div className="mt-9">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Room Amenities
              </h2>

              {room.amenities?.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {room.amenities.map((amenity, index) => (
                    <span
                      key={`${amenity}-${index}`}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No amenities listed.
                </p>
              )}
            </div>

            <div>
              <Booking
                roomId={roomId}
                hotelId={hotelId}
                onBookingChange={handleBookingChange}
              />
            </div>

            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-100 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/hotel/${hotelId}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
              >
                Back to Hotel
              </Link>

              <div className="flex flex-col gap-3 sm:flex-row">
                {!room.isAvailable ? (
                  <button
                    type="button"
                    disabled
                    className="min-h-12 cursor-not-allowed rounded-full bg-slate-200 px-7 py-3 text-sm font-semibold text-slate-500"
                  >
                    Room Unavailable
                  </button>
                ) : isRoomInCart ? (
                  <>
                    <button
                      type="button"
                      onClick={handleRemoveFromCart}
                      aria-label="Remove room from cart"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 cursor-pointer"
                    >
                      <PiTrash size={19} />
                      Remove
                    </button>

                    <Link
                      href="/cart"
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-amber-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
                    >
                      View Cart
                    </Link>
                  </>
                ) : (
                  <button
                    disabled={!bookingInfo}
                    type="button"
                    onClick={handleAddToCart}
                    className="min-h-12 rounded-full cursor-pointer bg-slate-900 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 hover:shadow-lg disabled:bg-gray-500 disabled:text-white disabled:cursor-not-allowed"
                  >
                    Book This Room
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
        <CommentSection
          comments={comments.data?.comments}
          roomId={roomId}
          hotelId={hotelId}
        />
      </div>
    </main>
  );
}
