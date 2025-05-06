import mongoose from "mongoose";
import { mongoRepo } from "../repository/mongoRepo";
import { User } from "../model/userSchema";

// Mock mongoose e schema
jest.mock("mongoose");
jest.mock("../model/messageSchema", () => ({
  MessageSeries: {
    find: jest.fn(),
  },
}));

describe("MongoRepository tests:", () => {
  let repository: mongoRepo;

  beforeAll(() => {
    (mongoose.connect as jest.Mock).mockResolvedValue({}); // Simuliamo che la connessione con MongoDB sia andata
    repository = new mongoRepo();
  });
});
