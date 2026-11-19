import connectDb from "@/configs/db";
import Comment from "@/models/Comment";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDb();

    const comments = await Comment.find({ isApproved: true })
      .populate("user", "name")
      .populate("hotel", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, comments }, { status: 200 });
  } catch (err) {
    console.log(err.message);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
