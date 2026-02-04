import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const baseMongooseOpts = {
  serverSelectionTimeoutMS: 10000,
};

export const connectMongoDB = async () => {
  try {
    const url = process.env.MONGO_URL;
    if (!url) throw new ERROR("Falta Mongo URL en el .env");
    await mongoose.connect(url, baseMongooseOpts);
    console.log("¡✅ Conectado a MongoDB de forma exitosa!");
  } catch (error) {
    console.error(error);
    procces.exit(1);
  }
};

export const connectMongoAtlasDB = async () => {
  try {
    const url = process.env.MONGO_ATLAS_URL;
    if (!url) throw new ERROR("Falta Mongo Atlas URL en el .env");
    await mongoose.connect(url, baseMongooseOpts);
    console.log("¡✅ Conectado a Mongo Atlas de forma exitosa!");
  } catch (error) {
    console.error(error);
    procces.exit(1);
  }
};

export const connectAuto = async () => {
  const target = (process.env.MONGO_TARGET || "LOCAL").toUpperCase();
  if (target === "ATLAS") return connectMongoAtlasDB();
  return connectMongoDB();
};
