import { Collection } from "mongodb";
import { MongoHelper } from "../helpers/mongo-helper";
import { LogMongoRepository } from "./log";

describe("Log Mongo Repository", () => {
  let errorCollection: Collection;

  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  beforeEach(async () => {
    errorCollection = await MongoHelper.getColletion("errors");
    await errorCollection.deleteMany({});
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  test("Should create an error log on success", async () => {
    const errorStack = "any_stack";

    const sut = new LogMongoRepository();
    await sut.logError(errorStack);

    const countErrorDocuments = await errorCollection.countDocuments();
    expect(countErrorDocuments).toBe(1);
  });
});
