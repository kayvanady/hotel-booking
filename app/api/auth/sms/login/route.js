import connectDb from "@/configs/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const validatePhone = (phone) => /^09\d{9}$/.test(phone);

export async function POST(req) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, message: "Phone number and password are required" },
        { status: 400 }
      );
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, message: "Phone number is invalid" },
        { status: 400 }
      );
    }

    await connectDb();

    
    const user = await User.findOne({ phone }).select('password role');
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this phone number" },
        { status: 404 }
      );
    }
   

    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) {
      return NextResponse.json(
        { success: false, message: "Password is invalid" },
        { status: 401 }
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
      { expiresIn: "7d" }
    );
    const refreshToken = jwt.sign(
      accessPayload,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
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

    return NextResponse.json({
      success: true,
      message: "Welcome back",
      redirectTo: user.role === "admin" ? "/admin/dashboard" : "/profile",
      user: {
        id: user._id.toString(),
        role: user.role,
        phone: user.phone,
        name: user.name,
        favorites: user.favorites || [],
      },
    });
  } catch (err) {
    console.error(err.message);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}