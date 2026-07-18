import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Povezan: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Greška pri povezivanju: ${error.message}`);
    process.exit(1); // Ugasi server ako baza ne radi
  }
};

export default connectDB;