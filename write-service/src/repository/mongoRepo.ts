// Questa classe servirà per la gestione di MongoDB
import mongoose from "mongoose";
import { MessageSeries } from "../model/messageSchema";

export class mongoRepo {
  async connect() {
    await mongoose.connect(
      process.env.MONGO_URL || "mongodb://localhost:27017/projectOne"
    );
  }

  async saveSeries({ topic, payload }: { topic: string; payload: string }) {
    const parts = payload.split("|"); // Split userId and message

    const newSeries = new MessageSeries({
      metadata: { topic, payload: parts[1], userId: parts[0] },
    });

    await newSeries.save();
  }
}
