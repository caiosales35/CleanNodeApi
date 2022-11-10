import { DbAddAccount } from "./db-add-account";
import {
  AccountModel,
  AddAccountModel,
  AddAccountRepository,
  Encrypter,
} from "./db-add-account-protocols";

interface SutTypes {
  sut: DbAddAccount;
  encrypterStub: Encrypter;
  addAccountRepositoryStub: AddAccountRepository;
}

const hashedPassword = "hashedPassword";
const validId = "valid";

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

const makeEncrypter = (): Encrypter => {
  class EncryptStub implements Encrypter {
    async encrypt(value: string): Promise<string> {
      return new Promise((resolve) => resolve(hashedPassword));
    }
  }
  const encrypterStub = new EncryptStub();
  return encrypterStub;
};

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter();
  const addAccountRepositoryStub = makeAddAccountRepository();
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub);
  return { sut, encrypterStub, addAccountRepositoryStub };
};

describe("DbAddAccount Usecase", () => {
  test("Should call Encrypter with correct password", async () => {
    const { sut, encrypterStub } = makeSut();
    const encryptSpy = jest.spyOn(encrypterStub, "encrypt");
    const accountData = {
      name: "valid_name",
      email: "valid@email.com",
      password: "validPassword",
    };
    await sut.add(accountData);
    expect(encryptSpy).toHaveBeenCalledWith(accountData.password);
  });
  test("Should throw if Encrypter throws", async () => {
    const { sut, encrypterStub } = makeSut();
    jest
      .spyOn(encrypterStub, "encrypt")
      .mockReturnValue(new Promise((resolve, reject) => reject(new Error())));

    const accountData = {
      name: "valid_name",
      email: "valid@email.com",
      password: "validPassword",
    };
    const promise = sut.add(accountData);
    await expect(promise).rejects.toThrow();
  });
  test("Should call AddAccountRepository with correct values", async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addAccountRepositoryStub, "add");
    const accountData = {
      name: "valid_name",
      email: "valid@email.com",
      password: "validPassword",
    };
    await sut.add(accountData);
    expect(addSpy).toHaveBeenCalledWith({
      ...accountData,
      password: "hashedPassword",
    });
  });
  test("Should throw if AddAccountRepository throws", async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    jest
      .spyOn(addAccountRepositoryStub, "add")
      .mockReturnValue(new Promise((resolve, reject) => reject(new Error())));
    const accountData = {
      name: "valid_name",
      email: "valid@email.com",
      password: "validPassword",
    };
    const promise = sut.add(accountData);
    await expect(promise).rejects.toThrow();
  });
  test("Should return an account on success", async () => {
    const { sut } = makeSut();
    const accountData = {
      name: "valid_name",
      email: "valid@email.com",
      password: "validPassword",
    };
    const responseAccount = await sut.add(accountData);
    expect(responseAccount).toEqual({
      ...accountData,
      password: hashedPassword,
      id: validId,
    });
  });
});
