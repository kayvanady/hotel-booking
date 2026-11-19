import connectDb from "@/configs/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDb();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Please Log in your account" },
        { status: 401 },
      );
    }

    let payload;
    try {
      payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Token expired or invalid" },
        { status: 401 },
      );
    }

    const user = await User.findById(payload.userId)
      .select("name phone email role createdAt _id")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
}
