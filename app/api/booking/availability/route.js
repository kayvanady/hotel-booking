import connectDb from "@/configs/db";
import Booking from "@/models/Booking";
import Hotel from "@/models/Hotel";
import { getCurrentUser } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
  
    await connectDb();

    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const roomId = searchParams.get("roomId");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!hotelId || !roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all requested fields ",
        },
        { status: 400 },
      );
    }

    const startDate = new Date(`${checkIn}T00:00:00.000Z`);
    const endDate = new Date(`${checkOut}T00:00:00.000Z`);

    if (endDate <= startDate) {
      return NextResponse.json(
        {
          success: false,
          message: "End date must be after start date",
        },
        { status: 400 },
      );
    }

    const hotel = await Hotel.findById(hotelId).select("rooms");

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel not found",
        },
        { status: 404 },
      );
    }

    const room = hotel.rooms.find((room) => room._id.toString() === roomId);

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          message: "Room not found",
        },
        { status: 404 },
      );
    }

    const isAvailable = room.isAvailable;

    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          message: "Room is not available",
        },
        { status: 400 },
      );
    }

    const conflict = await Booking.exists({
      hotel: hotelId,
      roomId,
      status: { $in: ["pending", "confirmed"] },
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate },
    });

    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          message: "Room is not available for the selected dates",
        },
        { status: 400 },
      );
    }

    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      success: true,
      available: true,
      nights,
      pricePerNight: room.price,
      totalPrice: nights * room.price,
    });

  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while checking room availability",
      },
      { status: 500 },
    );
  }
}
