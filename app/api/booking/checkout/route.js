import connectDb from "@/configs/db";
import Booking from "@/models/Booking";
import Hotel from "@/models/Hotel";
import { getCurrentUser } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDb();

    const currentUser = getCurrentUser(req);

    if (!currentUser.success) {
      return NextResponse.json(
        { success: false, message: "Please Login" },
        { status: 401 },
      );
    }

    const userId = currentUser.userId;

    const bookings = await req.json();

    if (!Array.isArray(bookings) || bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty" },
        { status: 400 },
      );
    }

    const createdBookings = [];

    for (const item of bookings) {
      const {
        hotelId,
        roomId,
        checkIn,
        checkOut,
        guests,
        hotelName,
        roomNumber,
      } = item;

      if (!hotelId || !roomId || !checkIn || !checkOut || guests == null) {
        return NextResponse.json(
          { success: false, message: "Missing required fields" },
          { status: 400 },
        );
      }

      const startDate = new Date(`${checkIn}T00:00:00.000Z`);
      const endDate = new Date(`${checkOut}T00:00:00.000Z`);

      const hotel = await Hotel.findById(hotelId);

      if (!hotel) {
        return NextResponse.json(
          { success: false, message: "Hotel not found" },
          { status: 404 },
        );
      }

      const room = hotel.rooms.find((room) => room._id.toString() === roomId);

      if (!room) {
        return NextResponse.json(
          { success: false, message: "Room not found" },
          { status: 404 },
        );
      }

      if (!room.isAvailable) {
        return NextResponse.json(
          { success: false, message: "Room is not available" },
          { status: 400 },
        );
      }

      const existingBooking = await Booking.exists({
        hotel: hotelId,
        roomId,
        status: { $in: ["pending", "confirmed"] },
        checkIn: { $lt: endDate },
        checkOut: { $gt: startDate },
      });

      if (existingBooking) {
        return NextResponse.json(
          { success: false, message: "Room is already booked" },
          { status: 409 },
        );
      }

      const nights = (endDate - startDate) / (1000 * 60 * 60 * 24);
      const totalPrice = room.price * nights;

      const newBooking = await Booking.create({
        user: userId,
        hotel: hotelId,
        roomId,
        checkIn: startDate,
        checkOut: endDate,
        hotelName,
        roomNumber,
        guests,
        totalPrice,
        status: "confirmed",
      });

      createdBookings.push(newBooking);
    }

    return NextResponse.json(
      {
        success: true,
        message: "All rooms reserved successfully",
        bookings: createdBookings,
      },
      { status: 201 },
    );
  } catch (err) {
    console.log(err.message);

    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
