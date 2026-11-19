import connectDb from "@/configs/db";
import Booking from "@/models/Booking";
import { getCurrentUser } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser.success) {
      return NextResponse.json(
        { success: false, message: "Please Login" },
        { status: 401 },
      );
    }

    await connectDb();

    const userId = currentUser.userId;
    const bookings = await Booking.find({ user: userId }).lean();

    if (bookings.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "There is no reservation for this user found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, bookings }, { status: 200 });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
