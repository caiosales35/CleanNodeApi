import { Collection } from "mongodb";
import { MongoHelper } from "../helpers/mongo-helper";
import { AccountMongoRepository } from "./account";

let accountCollection: Collection;

const makeSut = (): AccountMongoRepository => {
  return new AccountMongoRepository();
};

describe("Account Mongo Repository", () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  beforeEach(async () => {
    accountCollection = await MongoHelper.getColletion("accounts");
    await accountCollection.deleteMany({});
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  test("Shoud return an account on add success", async () => {
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
  test("Shoud return an account on loadByEmail success", async () => {
    const sut = makeSut();
    const accountData = {
      name: "any",
      email: "anny@email.com",
      password: "any_password",
    };
    await accountCollection.insertOne(accountData);
    const account = await sut.loadByEmail(accountData.email);
    expect(account).toBeTruthy();
    expect(account.id).toBeTruthy();
    expect(account.name).toBe(accountData.name);
    expect(account.email).toBe(accountData.email);
    expect(account.password).toBe(accountData.password);
  });
  test("Shoud return null if loadByEmail fails", async () => {
    const sut = makeSut();
    const email = "anny@email.com";
    const account = await sut.loadByEmail(email);
    expect(account).toBeFalsy();
  });
  test("Shoud update the account access token on updateAccessToken success", async () => {
    const token = "ansafasfas";

    const sut = makeSut();
    const accountData = {
      name: "any",
      email: "anny@email.com",
      password: "any_password",
    };

    await accountCollection.insertOne(accountData);
    const insertedAccount = await sut.loadByEmail(accountData.email);

    expect(insertedAccount.accessToken).toBeFalsy();

    await sut.updateAccessToken(insertedAccount.id, token);
    const updatedAccount = await sut.loadByEmail(accountData.email);

    expect(updatedAccount).toBeTruthy();
    expect(updatedAccount.id).toBeTruthy();
    expect(updatedAccount.name).toBe(accountData.name);
    expect(updatedAccount.email).toBe(accountData.email);
    expect(updatedAccount.password).toBe(accountData.password);
    expect(updatedAccount.password).toBe(accountData.password);
    expect(updatedAccount.accessToken).toBe(token);
  });
});
