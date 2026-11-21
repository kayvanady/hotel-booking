import mongoose from "mongoose";

const connectDb = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }

    console.log(
      "MONGO_URL:",
      process.env.MONGO_URL?.startsWith("mongodb://")
        ? "Standard URI"
        : "SRV URI or Invalid",
    );

    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB connected successfully");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

export default connectDb;
