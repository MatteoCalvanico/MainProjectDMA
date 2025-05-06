import mongoose from "mongoose";

// Definizione dello schema per i dati utente
const userSchema = new mongoose.Schema();
/*{
    timestamp: { type: Date, default: Date.now },
    metadata: { topic: String, payload: String, userId: String },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "metadata",
      granularity: "seconds",
    },
  }*/

// Export del modello
export const Users = mongoose.model("Users", userSchema);
