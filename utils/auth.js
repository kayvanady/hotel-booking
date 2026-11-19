import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export default function isAdmin(req) {
  const accessToken = req.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Pleade Login first" },
      { status: 401 },
    );
  }

  let payload;
  try {
    payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (payload.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Sorry , this route is only for admins" },
        { status: 403 },
      );
    }
    return { isAdmin: true, userId: payload.userId };
  } catch {
    return NextResponse.json(
      { success: false, message: "invalid or expired accessToken" },
      { status: 401 },
    );
  }
}

export function getCurrentUser(req) {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please Login" },
      { stause: 401 },
    );
  }

  let payload;

  try {
    payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    return {
      success: true,
      userId: payload.userId,
      role: payload.role,
    };
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { stause: 500 },
    );
  }
}
