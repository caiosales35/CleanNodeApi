import request from "supertest";
import { MongoHelper } from "../../infra/db/mongodb/helpers/mongo-helper";
import app from "../config/app";

const URL = "/api/singup";

describe("Singup Routes", () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  beforeEach(async () => {
    const accountColletion = await MongoHelper.getColletion("accounts");
    await accountColletion.deleteMany({});
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  test("should return an account on success", async () => {
    const body = {
      name: "any",
      email: "any@email.com",
      password: "any_password",
      passwordConfirmation: "any_password",
    };

    await request(app).post(URL).send(body).expect(200);
  });
});
