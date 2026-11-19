import connectDb from "@/configs/db";
import Comment from "@/models/Comment";
import { getCurrentUser } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDb();
    const { roomId } = await params;

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "Room ID is required" },
        { status: 400 },
      );
    }

    const comments = await Comment.find({ room: roomId, isApproved: true })
      .sort({ createdAt: -1 })
      .populate("user")
      .lean();

    if (!comments.length === 0) {
      return NextResponse.json(
        { success: false, message: "No comments found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.log(error.message);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
