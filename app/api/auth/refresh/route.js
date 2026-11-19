import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDb from "@/configs/db";
import User from "@/models/User";

export async function POST() {
  const cookieStore = await cookies();

  try {
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token not found" },
        { status: 401 }
      );
    }

 
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      // Invalid token – clear both cookies
      const response = NextResponse.json(
        { success: false, message: "Invalid or expired refresh token" },
        { status: 401 }
      );
      response.cookies.delete("refreshToken");
      response.cookies.delete("accessToken");
      return response;
    }

    await connectDb();

    const user = await User.findById(payload.userId);
    if (!user) {
      const response = NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
      response.cookies.delete("refreshToken");
      response.cookies.delete("accessToken");
      return response;
    }


    if (user.refreshToken !== refreshToken) {
      const response = NextResponse.json(
        { success: false, message: "Refresh token mismatch" },
        { status: 401 }
      );
      response.cookies.delete("refreshToken");
      response.cookies.delete("accessToken");
      return response;
    }


    const newAccessToken = jwt.sign(
      { userId: user._id.toString(), phone: user.phone, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Access token refreshed successfully",
      user: {
        id: user._id.toString(),
        phone: user.phone,
        role: user.role || "user",
      },
    });

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, 
      path: "/",
    });



    return response;
  } catch (err) {
    console.error("Refresh error:", err);
    const response = NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }
}