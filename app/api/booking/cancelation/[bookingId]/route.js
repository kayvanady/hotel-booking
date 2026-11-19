import Booking from "@/models/Booking";
import { getCurrentUser } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser.success) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { bookingId } = await params;

    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        user: currentUser.userId,
        status: { $in: ["confirmed", "pending"] },
      },
      { status: "cancelled" },
      { returnDocument: "after" },
    );
    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, message: "Booking not found or not owned by user" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error occurred while canceling booking" },
      { status: 500 },
    );
  }
}
