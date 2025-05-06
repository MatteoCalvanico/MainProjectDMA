// Questa classe servirà per la gestione di MongoDB
import mongoose from "mongoose";
import { User } from "../model/userSchema";

export class mongoRepo {
  async connect() {
    await mongoose.connect(
      process.env.MONGO_URL || "mongodb://localhost:27017/projectOne"
    );
  }

  async save({
    registerDate,
    userId,
    email,
  }: {
    registerDate: string | undefined;
    userId: string;
    email: string;
  }) {
    // Controlliamo se già esiste un utente con quell'id, in caso affemativo non lo aggiungiamo
    const existingUser = await User.findOne({ userId: userId });
    if (!existingUser) {
      const newUser = new User({
        registerDate: registerDate,
        userId: userId,
        email: email,
      });

      await newUser.save();
      return { success: true, message: "User created successfully" };
    } else {
      return {
        success: false,
        message: "User with this userId already exists",
      };
    }
  }

  private async find(param?: any) {
    console.log("Searching...");
    if (param == null) {
      const results = await User.find({});
      console.log("Find");
      return results;
    }
    const results = await User.find(param);
    console.log("Find");
    return results;
  }

  async findAll() {
    return this.find(null);
  }

  async findByRegisterDate(stamp: string) {
    return this.find({ registerDate: stamp });
  }

  async findByUserId(userId: string) {
    return this.find({ userId: userId });
  }

  async findByEmail(email: string) {
    return this.find({ email: email });
  }
}
