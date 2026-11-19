import connectDb from "@/configs/db";
import Comment from "@/models/Comment";
import isAdmin from "@/utils/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }
    const { commentId } = await params;
    const { isApproved } = await req.json();

    if (!commentId) {
      return NextResponse.json(
        { success: false, message: "Comment Id is required" },
        { status: 400 },
      );
    }

    await connectDb();

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { isApproved },
      { returnDocument: "after" },
    );
    if (!updatedComment) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: `Comment ${isApproved ? "approved" : "denied"}`,
        updatedComment,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
