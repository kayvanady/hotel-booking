import connectDb from "@/configs/db";
import Hotel from "@/models/Hotel";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDb();

    const { hotelId, roomId } = await params;

    const hotel = await Hotel.findById(hotelId).lean();

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

    return NextResponse.json(
      {
        success: true,
        hotel,
        room,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
