import connectDb from "@/configs/db";
import Hotel from "@/models/Hotel";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDb();

    const limit = 4;

    const hotels = await Hotel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json({ success: true, hotels });
  } catch (err) {
    console.log(err.message);

    return NextResponse.json(
      { success: true, message: "Server error " },
      { status: 500 },
    );
  }
}
