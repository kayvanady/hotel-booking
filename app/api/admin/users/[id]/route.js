import connectDb from "@/configs/db";
import User from "@/models/User";
import isAdmin from "@/utils/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    const { name, role, email , phone} = await req.json();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User id not found" },
        { status: 404 },
      );
    }

    await connectDb();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (email !== undefined) user.email = email.trim() || null;
    if (name !== undefined) user.name = name.trim() || "";
    if (role !== undefined) user.role = role;
    await user.save();

    const updatedUser = await User.findById(id)
      .select("name email role phone")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully ",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = isAdmin(req);
    if (!auth.isAdmin) {
      return auth;
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "User id not found" },
        { status: 404 },
      );
    }

    await connectDb();

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User  not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
}
