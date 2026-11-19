import connectDb from "@/configs/db";
import Comment from "@/models/Comment";
import Hotel from "@/models/Hotel";
import isAdmin from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    await connectDb();

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || 1;
    const limit = 5;

    const comments = await Comment.find({ isAdminReply: false })
      .populate("hotel", "name rooms")
      .populate("user", "name phone")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    if (!comments) {
      return NextResponse.json(
        { success: false, message: "no comments found" },
        { status: 404 },
      );
    }

    const totalComments = await Comment.countDocuments({ isAdminReply: false });

    return NextResponse.json({ success: true, comments , totalComments }, { status: 200 });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
}
