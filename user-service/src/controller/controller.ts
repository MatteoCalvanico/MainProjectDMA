import { mongoRepo } from "../repository/mongoRepo";

export class controller {
  private mongo: mongoRepo;

  constructor(mongo: mongoRepo) {
    this.mongo = mongo;
  }
}
