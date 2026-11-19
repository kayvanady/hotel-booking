import connectDb from "@/configs/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

const validatePhone = (phone) => /^09\d{9}$/.test(phone);

export async function POST(req) {
  try {
    const { phone, name, email, password } = await req.json();

    if (!phone || !name || !email) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, message: "Phone number is invalid" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    await connectDb();

    
    let existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser && existingUser.isVerified === true) {
     
      return NextResponse.json(
        { success: false, message: "This email or phone is already registered" },
        { status: 400 }
      );
    }

  
    const otpCode = Math.floor(Math.random() * 90000 + 10000);
    const expireTime = new Date(Date.now() + 60 * 1000);

  
    const payload = {
      mobile: phone,
      templateId: process.env.IPPANEL_PATTERN,
      parameters: [{ name: "CODE", value: otpCode }],
    };

    const response = await fetch("https://api.sms.ir/v1/send/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain",
        "x-api-key": process.env.IPPANEL_PASS,
      },
      body: JSON.stringify(payload),
    });

    if (response.status !== 200) {
      return NextResponse.json(
        { success: false, message: "Failed sending OTP code" },
        { status: 500 }
      );
    }

    const hashedPass = await bcrypt.hash(password, 10);

    if (existingUser && existingUser.isVerified === false) {
     
      existingUser.name = name;
      existingUser.email = email;
      existingUser.phone = phone;
      existingUser.password = hashedPass;
      existingUser.otp = { code: otpCode, expiresAt: expireTime };
      existingUser.isVerified = false; 
      await existingUser.save();
    } else {
   
      await User.create({
        password: hashedPass,
        email,
        name,
        phone,
        otp: { code: otpCode, expiresAt: expireTime },
        isVerified: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error(err.message);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}