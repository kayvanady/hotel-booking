import connectDb from "@/configs/db";
import Hotel from "@/models/Hotel";
import isAdmin from "@/utils/auth";
import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

export async function PUT(req, { params }) {
  try {
    const auth = isAdmin(req);
    if (!auth.isAdmin) return auth;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "HotelId not found" },
        { status: 404 },
      );
    }

    await connectDb();
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return NextResponse.json(
        { success: false, message: "Hotel not found" },
        { status: 404 },
      );
    }

    const formData = await req.formData();

    const name = formData.get("name");
    const shortDescription = formData.get("shortDescription");
    const fullDescription = formData.get("fullDescription");
    const thumbnail = formData.get("thumbnail");
    const stars = formData.get("stars") || 1;
    const price = formData.get("price");
    const rooms = formData.get("rooms");
    const address = formData.get("address");

    if (
      !name ||
      !shortDescription ||
      !fullDescription ||
      !thumbnail ||
      !price
    ) {
      return NextResponse.json(
        { success: false, message: "Please fill all required fields" },
        { status: 400 },
      );
    }

  

    let hotelRooms = [];
    if (rooms) {
      try {
        hotelRooms = JSON.parse(rooms.toString());
        if (!Array.isArray(hotelRooms) || hotelRooms.length === 0) {
          return NextResponse.json(
            { success: false, message: "At least one room is required" },
            { status: 400 },
          );
        }
        for (const room of hotelRooms) {
          if (!room.roomNumber || !room.type || !room.price) {
            return NextResponse.json(
              {
                success: false,
                message: "Each room must have roomNumber, type, and price",
              },
              { status: 400 },
            );
          }
        }
      } catch (err) {
        return NextResponse.json(
          { success: false, message: "Invalid rooms format" },
          { status: 400 },
        );
      }
    }
    let addressObj;
    if (address !== null) {
      try {
        addressObj = JSON.parse(address.toString());
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid address" },
          { status: 400 },
        );
      }
    }

    if (name !== null) hotel.name = name;
    if (shortDescription !== null) hotel.shortDescription = shortDescription;
    if (fullDescription !== null) hotel.fullDescription = fullDescription;
    if (stars !== null) hotel.stars = Number(stars);
    if (price !== null) hotel.price = Number(price);
    if (rooms !== null) hotel.rooms = hotelRooms;
    if (address !== null) hotel.address = addressObj;

    if (thumbnail && typeof thumbnail !== "string") {
     
      const bytes = await thumbnail.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const processedBuffer = await sharp(buffer)
        .resize(800, 450, { fit: "cover", withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();

      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      const uploadDir = path.join(process.cwd(), "public", "images", "hotels");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, processedBuffer);

      hotel.thumbnail = `/images/hotels/${filename}`;
    }

    await hotel.save();

    return NextResponse.json(
      { success: true, message: "Hotel updated successfully", hotel },
      { status: 200 },
    );
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
