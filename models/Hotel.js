import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  type: {
    type: String,
    enum: ["single", "double", "suite", "deluxe"],
    required: true,
  },
  price: { type: Number, required: true },
  capacity: { type: Number, default: 2 },
  amenities: [String],
  isAvailable: { type: Boolean, default: true },
});

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    stars: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
      required : true
    },
    thumbnail: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rooms: {
      type: [roomSchema],
      default: [],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema);
