import mongoose from "mongoose";

// Definizione dello schema per i dati degi Users
const userSchema = new mongoose.Schema({
  registerDate: { type: Date, default: Date.now },
  userId: String,
  email: String,
});

// Export del modello
export const Users = mongoose.model("Users", userSchema);
