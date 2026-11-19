import connectDb from "@/configs/db";
import Comment from "@/models/Comment";
import isAdmin from "@/utils/auth";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      if (!auth.isAdmin) {
        return auth;
      }
    }

    const { commentId } = await params;
    if (!commentId) {
      return NextResponse.json(
        { success: false, message: "Comment Id is required" },
        { status: 400 },
      );
    }

    await connectDb();

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return NextResponse.json(
        { success: false, message: "Comment not  found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: true, message: "Comment deleted successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
}
