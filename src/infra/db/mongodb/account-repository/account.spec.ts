import { MongoHelper } from "../helpers/mongo-helper";
import { AccountMongoRepository } from "./account";

const makeSut = (): AccountMongoRepository => {
  return new AccountMongoRepository();
};

describe("Account Mongo Repository", () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  beforeEach(async () => {
    const accountColletion = MongoHelper.getColletion("accounts");
    await accountColletion.deleteMany({});
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  test("Shoudl return an account on success", async () => {
    const sut = makeSut();
    const accountData = {
      name: "any",
      email: "anny@email.com",
      password: "any_password",
    };
    const account = await sut.add(accountData);
    expect(account).toBeTruthy();
    expect(account.id).toBeTruthy();
    expect(account.name).toBe(accountData.name);
    expect(account.email).toBe(accountData.email);
    expect(account.password).toBe(accountData.password);
  });
});
