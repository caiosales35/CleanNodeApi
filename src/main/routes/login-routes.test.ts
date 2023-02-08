import { hash } from "bcrypt";
import { Collection } from "mongodb";
import request from "supertest";
import { MongoHelper } from "../../infra/db/mongodb/helpers/mongo-helper";
import app from "../config/app";
import env from "../config/env";

let accountColletion: Collection;

describe("Login Routes", () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  beforeEach(async () => {
    accountColletion = await MongoHelper.getColletion("accounts");
    await accountColletion.deleteMany({});
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  describe("POST /signup", () => {
    const URL = "/api/singup";

    test("should return 200 on signup", async () => {
      const body = {
        name: "any",
        email: "any@email.com",
        password: "any_password",
        passwordConfirmation: "any_password",
      };
      await request(app).post(URL).send(body).expect(200);
    });
  });

  describe("POST /login", () => {
    const URL = "/api/login";

    test("should return 200 on login", async () => {
      const password = "any_password";
      const account = {
        name: "any",
        email: "any@email.com",
        password: await hash(password, env.salt),
      };
      await accountColletion.insertOne(account);

      const body = {
        email: account.email,
        password: password,
      };
      await request(app).post(URL).send(body).expect(200);
    });

    test("should return 401 on failed login", async () => {
      const password = "any_password";
      const account = {
        name: "any",
        email: "any@email.com",
        password: await hash(password, env.salt),
      };
      await accountColletion.insertOne(account);

      const body = {
        email: account.email,
        password: "wrongPassword",
      };
      await request(app).post(URL).send(body).expect(401);
    });
  });
});
