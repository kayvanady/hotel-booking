import mongoose from "mongoose";

const connectDb = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return true;
    } else {
      await mongoose.connect(process.env.MONGO_URL);
    }
  } catch (err) {
    console.log(err.message);
    
  }
};
export default connectDb