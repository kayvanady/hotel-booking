import Hotel from "@/models/Hotel";
import isAdmin from "@/utils/auth";
import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

export async function POST(req) {
  try {
    
    const authResult = isAdmin(req);

    if (!authResult?.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
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

    // Validation 
    if (
      !name ||
      !shortDescription ||
      !fullDescription ||
      !thumbnail ||
      !price
    ) {
      return NextResponse.json(
        { success: false, message: "Please fill all required fields" },
        { status: 400 }
      );
    }

    
    if (!(thumbnail instanceof File) || thumbnail.size === 0) {
      return NextResponse.json(
        { success: false, message: "Valid thumbnail image is required" },
        { status: 400 }
      );
    }

    
    let hotelRooms = [];
    if (rooms) {
      try {
        hotelRooms = JSON.parse(rooms.toString());
        if (!Array.isArray(hotelRooms) || hotelRooms.length === 0) {
          return NextResponse.json(
            { success: false, message: "At least one room is required" },
            { status: 400 }
          );
        }
        for (const room of hotelRooms) {
          if (!room.roomNumber || !room.type || !room.price) {
            return NextResponse.json(
              {
                success: false,
                message: "Each room must have roomNumber, type, and price",
              },
              { status: 400 }
            );
          }
        }
      } catch (err) {
        return NextResponse.json(
          { success: false, message: "Invalid rooms format" },
          { status: 400 }
        );
      }
    }

   
    let addressObj = {};
    if (address) {
      try {
        addressObj = JSON.parse(address.toString());
      } catch (err) {
        return NextResponse.json(
          { success: false, message: "Invalid address format" },
          { status: 400 }
        );
      }
    }


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

    const imageUrl = `/images/hotels/${filename}`;

    
    const starsNum = Number(stars) || 1;

    
    const newHotel = new Hotel({
      name,
      shortDescription,
      fullDescription,
      thumbnail: imageUrl,
      stars: starsNum,
      price: Number(price),
      rooms: hotelRooms,       
      address: addressObj,
    });

    await newHotel.save();

    return NextResponse.json(
      { success: true, message: "Hotel added successfully", hotel: newHotel },
      { status: 201 }
    );
  } catch (err) {
    console.error("Server error:", err.message);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}