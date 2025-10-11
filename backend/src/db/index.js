  import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `Connected to MongoDB: DB host: ${connectInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error");
    process.exit(1);
  }
};

export default connectDB;
