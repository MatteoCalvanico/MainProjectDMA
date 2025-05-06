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
    const newSeries = new MessageSeries({
      metadata: { topic, payload },
    });

    await newSeries.save();
  }

  async findSeries(param?: object) {
    console.log("Searching...");
    if (param == null) {
      const results = await MessageSeries.find({});
      console.log("Find");
      return results;
    }
    const results = await MessageSeries.find(param);
    return results;
  }

  async findSeriesByTimestamp(stamp: string) {
    console.log("Searching...");
    const results = await MessageSeries.find({ timestamp: stamp });
    console.log("Find");
    return results;
  }
}
