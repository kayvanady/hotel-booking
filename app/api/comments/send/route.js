import connectDb from "@/configs/db";
import Comment from "@/models/Comment";
import { getCurrentUser } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser.success) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const { text, hotelId, roomId } = await req.json();
    if (text.length < 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment should be at least 5 characters",
        },
        { status: 400 },
      );
    }
    if (!hotelId || !roomId) {
      return NextResponse.json(
        {
          success: false,
          message: "Room Id and Hotel Id are required",
        },
        { status: 400 },
      );
    }
    await connectDb();

    const newComment = await Comment.create({
      user: currentUser.userId,
      hotel: hotelId,
      room: roomId,
      text,
    });
    return NextResponse.json(
      { success: true, message: "Comment submited successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.log(err.message);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 },
    );
  }
}
