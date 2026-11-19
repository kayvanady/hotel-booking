import connectDb from "@/configs/db";
import Booking from "@/models/Booking";
import Comment from "@/models/Comment";
import Hotel from "@/models/Hotel";
import User from "@/models/User";
import isAdmin from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = isAdmin(req);
  if (!auth.isAdmin) return auth;

  try {
    await connectDb();

    const now = new Date();
    const startOfWindow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6),
    );

    const [
      hotelCount,
      userCount,
      bookingCount,
      confirmedCount,
      pendingCount,
      cancelledCount,
      revenueResult,
      reviewsToModerate,
      weeklyResults,
      recentBookings,
    ] = await Promise.all([
      Hotel.countDocuments(),
      User.countDocuments({ role: "user" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Comment.countDocuments({ isAdminReply: false, isApproved: false }),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startOfWindow } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Booking.find()
        .select("_id user hotelName checkIn totalPrice status createdAt")
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const weeklyCounts = new Map(
      weeklyResults.map((item) => [item._id, item.count]),
    );
    const weeklyBookings = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWindow);
      date.setUTCDate(startOfWindow.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { date: key, count: weeklyCounts.get(key) || 0 };
    });

    return NextResponse.json({
      success: true,
      dashboard: {
        stats: {
          hotels: hotelCount,
          users: userCount,
          bookings: bookingCount,
          confirmedBookings: confirmedCount,
          pendingBookings: pendingCount,
          cancelledBookings: cancelledCount,
          revenue: revenueResult[0]?.total || 0,
          reviewsToModerate,
        },
        weeklyBookings,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Failed to load admin dashboard:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data." },
      { status: 500 },
    );
  }
}
