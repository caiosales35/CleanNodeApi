import { DbAddAccount } from "./db-add-account";
import {
  AccountModel,
  AddAccountModel,
  AddAccountRepository,
  Hasher,
} from "./db-add-account-protocols";

interface SutTypes {
  sut: DbAddAccount;
  hasherStub: Hasher;
  addAccountRepositoryStub: AddAccountRepository;
}

const hashedPassword = "hashedPassword";
const validId = "valid";

const fakeAccountData = {
  name: "valid_name",
  email: "valid@email.com",
  password: "validPassword",
};

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add(accountData: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: validId,
        name: accountData.name,
        email: accountData.email,
        password: hashedPassword,
      };
      return new Promise((resolve) => resolve(fakeAccount));
    }
  }
  const addAccountRepositoryStub = new AddAccountRepositoryStub();
  return addAccountRepositoryStub;
};

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash(value: string): Promise<string> {
      return new Promise((resolve) => resolve(hashedPassword));
    }
  }
  const hasherStub = new HasherStub();
  return hasherStub;
};

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher();
  const addAccountRepositoryStub = makeAddAccountRepository();
  const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub);
  return { sut, hasherStub, addAccountRepositoryStub };
};

describe("DbAddAccount Usecase", () => {
  test("Should call Hasher with correct password", async () => {
    const { sut, hasherStub } = makeSut();
    const hasherSpy = jest.spyOn(hasherStub, "hash");
    const accountData = {
      name: "valid_name",
      email: "valid@email.com",
      password: "validPassword",
    };
    await sut.add(accountData);
    expect(hasherSpy).toHaveBeenCalledWith(accountData.password);
  });
  test("Should throw if Hasher throws", async () => {
    const { sut, hasherStub } = makeSut();
    jest
      .spyOn(hasherStub, "hash")
      .mockReturnValue(new Promise((resolve, reject) => reject(new Error())));

    const promise = sut.add(fakeAccountData);
    await expect(promise).rejects.toThrow();
  });
  test("Should call AddAccountRepository with correct values", async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addAccountRepositoryStub, "add");
    await sut.add(fakeAccountData);
    expect(addSpy).toHaveBeenCalledWith({
      ...fakeAccountData,
      password: "hashedPassword",
    });
  });
  test("Should throw if AddAccountRepository throws", async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    jest
      .spyOn(addAccountRepositoryStub, "add")
      .mockReturnValue(new Promise((resolve, reject) => reject(new Error())));
    const promise = sut.add(fakeAccountData);
    await expect(promise).rejects.toThrow();
  });
  test("Should return an account on success", async () => {
    const { sut } = makeSut();
    const responseAccount = await sut.add(fakeAccountData);
    expect(responseAccount).toEqual({
      ...fakeAccountData,
      password: hashedPassword,
      id: validId,
    });
  });
});
