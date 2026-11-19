import connectDb from "@/configs/db";
import User from "@/models/User";
import isAdmin from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query = search
      ? {
          $or: [
            { name: { $regex: search } },
            { email: { $regex: search } },
            { phone: { $regex: search } },
          ],
        }
      : {};

    await connectDb();

    const users = await User.find(query)
      .select("_id name email phone role createdAt")
      .lean();

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
}
