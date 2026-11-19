import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { otpCode, phone } = await req.json();

    if (!otpCode || !phone) {
      return NextResponse.json(
        { success: false, message: "Phone number and OTP code are required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ phone }).select(
      "name phone email favorites otp role",
    );
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const { otp } = user;

    if (!otp || otp.code !== otpCode) {
      return NextResponse.json(
        { success: false, message: "Invalide OTP " },
        { status: 401 },
      );
    }

    const currentTime = new Date().getTime();
    const isExpired = currentTime > otp.expiresAt;
    if (isExpired) {
      user.otp = null;
      await user.save();
      return NextResponse.json(
        { success: false, message: "OTP expired" },
        { status: 401 },
      );
    }

    const accessPayload = {
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone,
    };

    const accessToken = jwt.sign(
      accessPayload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" },
    );
    const refreshToken = jwt.sign(
      accessPayload,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );

    user.refreshToken = refreshToken;
    user.otp = null;
    user.isVerified = true;
    user.lastLoginAt = new Date();
    await user.save();

    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message: "OTP code is accepted",
        redirectTo: user.role === "admin" ? "/admin/dashboard" : "profile",
        user: {
          id: user._id.toString(),
          role: user.role,
          phone: user.phone,
          name: user.name,
          favorites: user.favorites || [],
        },
      },
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
