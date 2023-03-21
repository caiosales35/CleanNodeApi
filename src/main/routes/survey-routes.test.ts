import { Collection } from "mongodb";
import request from "supertest";
import { MongoHelper } from "../../infra/db/mongodb/helpers/mongo-helper";
import app from "../config/app";

let surveyColletion: Collection;

describe("Survey Routes", () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  beforeEach(async () => {
    surveyColletion = await MongoHelper.getColletion("surveys");
    await surveyColletion.deleteMany({});
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  describe("POST /survey", () => {
    const URL = "/api/surveys";

    test("should return 204 on add survey success", async () => {
      const body = {
        question: "question 1",
        answers: [
          { answer: "answer 1", image: "any url" },
          { answer: "answer 2" },
        ],
      };
      await request(app).post(URL).send(body).expect(204);
    });
  });
});
