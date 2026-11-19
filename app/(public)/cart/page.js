"use client";

import { useAuth } from "@/context/Auth";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { CiShoppingCart } from "react-icons/ci";
import { FaArrowLeft, FaHotel, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
import { LuTrash } from "react-icons/lu";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { roomCart, removeCart, clearCart, totalPrice, isLoaded } = useCart();
  const { user } = useAuth();

  console.log(roomCart);

  const router = useRouter();

  const handleRemove = (cartItemId) => {
    removeCart(cartItemId);
    toast.success("Booking removed from cart");
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared successfully");
  };

  const checkoutMu = useMutation({
    mutationFn: async (bookingDetails) => {
      const res = await fetch("/api/booking/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingDetails),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Booking failed");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Booking successful!");
      clearCart();
      router.push("/user/hotels");
    },
    onError: (error) => {
      toast.error(error?.message || "Booking failed. Please try again.");
    },
  });

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please log in to proceed with checkout");
      return;
    }
    const bookingDetails = roomCart.map((item) => ({
      hotelId: item.hotelId,
      roomId: item.roomId,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      guests: item.guests,
      totalPrice: item.totalPrice,
      hotelName: item.hotelName,
      roomNumber: item.roomNumber,
    }));
    checkoutMu.mutate(bookingDetails);
  };

  if (!isLoaded) {
    return (
      <main className="container mx-auto min-h-[50vh] px-4 py-12">
        <p className="text-center text-gray-500">Loading cart...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto min-h-screen px-4 py-10">
      {!roomCart.length === 0 && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="mt-2 text-gray-500">
            Review your room bookings before checkout.
          </p>
        </div>
      )}

      {!user ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <CiShoppingCart className="mx-auto mb-4 text-6xl text-gray-400" />

          <h2 className="text-xl font-semibold text-gray-800">
            Please log in to view your cart
          </h2>

          <p className="mt-2 text-gray-500">
            Log in to continue with your room bookings.
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-flex rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-700"
          >
            Log In
          </Link>
        </div>
      ) : roomCart.length === 0 ? (
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <CiShoppingCart className="text-5xl text-gray-500" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">
            Your Cart Is Empty
          </h2>

          <p className="mt-3 max-w-sm text-gray-500">
            You haven't added any room bookings yet. Explore our hotels and find
            the perfect room for your next stay.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-700"
          >
            <FaArrowLeft />
            Discover More
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <section className="space-y-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Bookings ({roomCart.length})
              </h2>

              <button
                type="button"
                onClick={handleClearCart}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer font-medium text-red-600 transition hover:bg-red-50"
              >
                <LuTrash />
                Clear Cart
              </button>
            </div>

            {roomCart.map((item) => (
              <article
                key={item.cartItemId}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row">
                  <Link
                    href={`/hotel/${item.hotelId}/${item.roomId}`}
                    className="relative block h-52 shrink-0 bg-gray-100 sm:h-auto sm:w-52"
                  >
                    <Image
                      src={item.roomThumbnail || "/images/slider.jpg"}
                      alt={item.roomType || "Hotel room"}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between gap-5 p-5">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/hotel/${item.hotelId}/${item.roomId}`}
                            className="text-lg font-bold text-gray-900 transition hover:text-gray-600"
                          >
                            {item.hotelName}
                          </Link>

                          <p className="mt-1 text-sm text-gray-500">
                            Room {item.roomNumber || "—"} ·{" "}
                            {item.roomType || "Standard Room"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.cartItemId)}
                          aria-label={`Remove ${item.hotelName} booking`}
                          className="shrink-0 rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        >
                          <LuTrash />
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
                        <div>
                          <p className="text-xs text-gray-500">Check-in</p>
                          <p className="mt-1 font-medium text-gray-800">
                            {item.checkIn || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Check-out</p>
                          <p className="mt-1 font-medium text-gray-800">
                            {item.checkOut || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Guests</p>
                          <p className="mt-1 font-medium text-gray-800">
                            {item.guests || 2} guests
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="mt-1 font-medium text-gray-800">
                            {item.nights ?? "—"}{" "}
                            {item.nights === 1 ? "night" : "nights"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-3 border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-500">
                        ${Number(item.pricePerNight || 0).toLocaleString()} /
                        night
                      </p>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">Booking total</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${Number(item.totalPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-gray-900">Booking Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-3 text-gray-600">
                <span>Bookings</span>
                <span>{roomCart.length}</span>
              </div>

              <div className="flex items-center justify-between gap-3 text-gray-600">
                <span>Total nights</span>
                <span>
                  {roomCart.reduce(
                    (sum, item) => sum + (Number(item.nights) || 0),
                    0,
                  )}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${Number(totalPrice).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Final availability and pricing will be checked before your
                  booking is confirmed.
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700"
            >
              <p>Checkout</p>
              <FaArrowRight />
            </button>

            <Link
              href="/"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <FaHotel />
              Explore Hotels
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
