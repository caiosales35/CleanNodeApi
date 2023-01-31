import { DbAuthentication } from "./db-authentication";
import {
  AccountModel,
  AuthenticationModel,
  Encrypter,
  HashComparer,
  LoadAccountByEmailRepository,
  UpdateAccessTokenRepository,
} from "./db-authentication-protocols";

interface SutType {
  sut: DbAuthentication;
  loadAccountByEmailRepository: LoadAccountByEmailRepository;
  hashComparerStub: HashComparer;
  encrypterStub: Encrypter;
  updateAccessTokenRepositoryStub: UpdateAccessTokenRepository;
}

const fakeAuthentication: AuthenticationModel = {
  email: "any@email.com",
  password: "any",
};

const fakeAccount: AccountModel = {
  id: "any_id",
  email: "any@email.com.br",
  password: "any password",
  name: "any name",
};

const mockedToken = "any_token";

class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
  async loadByEmail(email: string): Promise<AccountModel> {
    return new Promise((resolve) => resolve(fakeAccount));
  }
}

class HashComparerStub implements HashComparer {
  async compare(value: string, hash: string): Promise<boolean> {
    return true;
  }
}

class EncrypterStub implements Encrypter {
  async encrypt(value: string): Promise<string> {
    return mockedToken;
  }
}

class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
  async updateAccessToken(id: string, token: string): Promise<void> {
    return;
  }
}

const makeSut = (): SutType => {
  const loadAccountByEmailRepository = new LoadAccountByEmailRepositoryStub();
  const hashComparerStub = new HashComparerStub();
  const encrypterStub = new EncrypterStub();
  const updateAccessTokenRepositoryStub = new UpdateAccessTokenRepositoryStub();
  const sut = new DbAuthentication(
    loadAccountByEmailRepository,
    hashComparerStub,
    encrypterStub,
    updateAccessTokenRepositoryStub
  );
  return {
    sut,
    loadAccountByEmailRepository,
    hashComparerStub,
    encrypterStub,
    updateAccessTokenRepositoryStub,
  };
};

describe("DbAuthentication UseCase", () => {
  test("Should call LoadAccountByEmailRepository with correct email", async () => {
    const { sut, loadAccountByEmailRepository } = makeSut();
    const loadSpy = jest.spyOn(loadAccountByEmailRepository, "loadByEmail");
    await sut.auth(fakeAuthentication);
    expect(loadSpy).toHaveBeenLastCalledWith(fakeAuthentication.email);
  });
  test("Should throw if LoadAccountByEmailRepository throws", async () => {
    const { sut, loadAccountByEmailRepository } = makeSut();

    jest
      .spyOn(loadAccountByEmailRepository, "loadByEmail")
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error()))
      );

    const promise = sut.auth(fakeAuthentication);
    await expect(promise).rejects.toThrow();
  });
  test("Should return null if LoadAccountByEmailRepository returns null", async () => {
    const { sut, loadAccountByEmailRepository } = makeSut();
    jest
      .spyOn(loadAccountByEmailRepository, "loadByEmail")
      .mockReturnValue(null);
    const accessToken = await sut.auth(fakeAuthentication);
    expect(accessToken).toBe(null);
  });
  test("Should call HashCompare with correct values", async () => {
    const { sut, hashComparerStub } = makeSut();
    const compareSpy = jest.spyOn(hashComparerStub, "compare");
    await sut.auth(fakeAuthentication);
    expect(compareSpy).toBeCalledWith(
      fakeAuthentication.password,
      fakeAccount.password
    );
  });
  test("Should throw if HashComparer throws", async () => {
    const { sut, hashComparerStub } = makeSut();
    jest
      .spyOn(hashComparerStub, "compare")
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error()))
      );
    const promise = sut.auth(fakeAuthentication);
    await expect(promise).rejects.toThrow();
  });
  test("Should return null if HashComparer returns false", async () => {
    const { sut, hashComparerStub } = makeSut();
    jest
      .spyOn(hashComparerStub, "compare")
      .mockReturnValue(new Promise((resolve) => resolve(false)));
    const accessToken = await sut.auth(fakeAuthentication);
    expect(accessToken).toBe(null);
  });
  test("Should call Encrypter with correct id", async () => {
    const { sut, encrypterStub } = makeSut();
    const generateSpy = jest.spyOn(encrypterStub, "encrypt");
    await sut.auth(fakeAuthentication);
    expect(generateSpy).toBeCalledWith(fakeAccount.id);
  });
  test("Should throw if Encrypter throws", async () => {
    const { sut, encrypterStub } = makeSut();
    jest
      .spyOn(encrypterStub, "encrypt")
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error()))
      );
    const promise = sut.auth(fakeAuthentication);
    await expect(promise).rejects.toThrow();
  });
  test("Should call Encrypter with correct id", async () => {
    const { sut } = makeSut();
    const token = await sut.auth(fakeAuthentication);
    expect(token).toBe(mockedToken);
  });
  test("Should call UpdateAccessTokenRepository with correct values", async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut();
    const updateSpy = jest.spyOn(
      updateAccessTokenRepositoryStub,
      "updateAccessToken"
    );
    await sut.auth(fakeAuthentication);
    expect(updateSpy).toBeCalledWith(fakeAccount.id, mockedToken);
  });
  test("Should throw if UpdateAccessTokenRepository throws", async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut();
    jest
      .spyOn(updateAccessTokenRepositoryStub, "updateAccessToken")
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error()))
      );
    const promise = sut.auth(fakeAuthentication);
    await expect(promise).rejects.toThrow();
  });
});
