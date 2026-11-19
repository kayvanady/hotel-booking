import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connectDb from "@/configs/db";
import User from "@/models/User";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refreshToken")?.value;

    let userId;

    if (refreshToken) {
      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );
        userId = payload.userId;
      } catch (err) {
        console.log("Refresh token invalid during logout", err.message);
      }
    }

    if (userId) {
      await connectDb();

      await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: "" },
      });
    }

    const response = NextResponse.json(
      { success: true, message: "Logout Successfully" },
      { status: 200 },
    );

    response.cookies.delete("refreshToken", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.delete("accessToken", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
}
