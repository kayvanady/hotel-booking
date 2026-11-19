import connectDb from "@/configs/db";
import Hotel from "@/models/Hotel";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { "address.city": { $regex: search, $options: "i" } },
            { "address.state": { $regex: search, $options: "i" } },
            { "address.country": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const hotels = await Hotel.find(query).lean();

    return NextResponse.json({ success: true, hotels }, { status: 200 });
  } catch (err) {
    console.log(err.message);

    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
