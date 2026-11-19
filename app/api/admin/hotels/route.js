import connectDb from "@/configs/db";
import Hotel from "@/models/Hotel";
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
            { name: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
            { shortDescription: { $regex: search, $options: "i" } },
            { fullDescription: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    await connectDb();

    const hotels = await Hotel.find(query);
    return NextResponse.json({ success: true, hotels }, { status: 200 });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      { success: true, message: "Server error" },
      { status: 500 },
    );
  }
}
