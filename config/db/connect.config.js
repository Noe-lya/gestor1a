import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(`mongodb://127.0.0.1:27017/backend2`);
    console.log("¡✅ Conectado a MongoDB de forma exitosa!");
  } catch (error) {
    console.error(error);
    procces.exit(1);
  }
};

export const connectMongoAtlasDB = async () => {
  try {
    await mongoose.connect(`mongodb://127.0.0.1:27017/backend2`);
    console.log("¡✅ Conectado a Mongo Atlas de forma exitosa!");
  } catch (error) {
    console.error(error);
    procces.exit(1);
  }
};
