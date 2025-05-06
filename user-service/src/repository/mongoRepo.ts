// Questa classe servirà per la gestione di MongoDB
import mongoose from "mongoose";
import { Users } from "../model/userSchema";

export class mongoRepo {
  async connect() {
    await mongoose.connect(
      process.env.MONGO_URL || "mongodb://localhost:27017/projectOne"
    );
  }
}
