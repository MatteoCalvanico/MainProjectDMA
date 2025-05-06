import mongoose from "mongoose";

// Definizione dello schema per i messaggi MQTT
const messageSchemaSeries = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    metadata: { topic: String, payload: String },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "metadata",
      granularity: "seconds",
    },
  }
);

// Export del modello
export const MessageSeries = mongoose.model(
  "Message_series",
  messageSchemaSeries
);
