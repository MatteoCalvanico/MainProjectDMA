import { ParamType } from "../model/paramsType";
import { mongoRepo } from "../repository/mongoRepo";

export class controller {
  private mongo: mongoRepo;

  constructor(mongo: mongoRepo) {
    this.mongo = mongo;
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
    return await this.mongo.save({ registerDate, userId, email });
  }

  async find(param: string | null, type: ParamType) {
    if (param === null) {
      return this.mongo.findAll();
    }

    switch (type) {
      case ParamType.Id: {
        return this.mongo.findByUserId(param);
      }
      case ParamType.Email: {
        return this.mongo.findByEmail(param);
      }
      case ParamType.Stamp: {
        return this.mongo.findByRegisterDate(param);
      }
    }
  }
}
