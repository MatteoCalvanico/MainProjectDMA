import { mongoRepo } from "../repository/mongoRepo";

export class controller {
  private mongo: mongoRepo;

  constructor(mongo: mongoRepo) {
    this.mongo = mongo;
  }

  async findAllMessages() {
    return await this.mongo.findSeries();
  }

  async findByStamp(stamp: string) {
    return await this.mongo.findSeriesByTimestamp(stamp);
  }

  async findByUser(userId: string) {
    return await this.mongo.findSeriesByUserId(userId);
  }
}
