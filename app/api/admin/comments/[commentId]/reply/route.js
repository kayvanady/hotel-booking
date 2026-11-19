import connectDb from "@/configs/db";
import Comment from "@/models/Comment";
import isAdmin from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const auth = isAdmin(req);

    if (!auth.isAdmin) {
      return auth;
    }

    const { commentId } = await params;
    if (!commentId) {
      return NextResponse.json(
        { success: false, message: "Comment Id is required" },
        { status: 400 },
      );
    }
    

    const { text } = await req.json();
    const userId = auth.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: " userId is required" },
        { status: 400 },
      );
    }
    

    if (!text || text.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "At least 5 characters required" },
        { status: 400 },
      );
    }
  

    await connectDb();

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return NextResponse.json(
        { success: false, message: "Parent comment not found" },
        { status: 404 },
      );
    }

    const newComment = await Comment.create({
      user: userId,
      hotel: parentComment.hotel,
      room: parentComment.room,
      text: text.trim(),
      isApproved: true,
      parentComment: commentId,
      isAdminReply: true,
    });
    return NextResponse.json(
      { success: true, message: "Reply sent!", reply: newComment },
      { status: 200 },
    );
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
}
