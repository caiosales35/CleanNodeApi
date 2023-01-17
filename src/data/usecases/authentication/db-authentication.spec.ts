import { DbAuthentication } from "./db-authentication";
import {
  AccountModel,
  AuthenticationModel,
  HashComparer,
  LoadAccountByEmailRepository,
  TokenGenerator,
  UpdateAccessTokenRepository,
} from "./db-authentication-protocols";

interface SutType {
  sut: DbAuthentication;
  loadAccountByEmailRepository: LoadAccountByEmailRepository;
  hashComparerStub: HashComparer;
  tokenGeneratorStub: TokenGenerator;
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
  async load(email: string): Promise<AccountModel> {
    return new Promise((resolve) => resolve(fakeAccount));
  }
}

class HashComparerStub implements HashComparer {
  async compare(value: string, hash: string): Promise<boolean> {
    return true;
  }
}

class TokenGeneratorStub implements TokenGeneratorStub {
  async generate(id: string): Promise<string> {
    return mockedToken;
  }
}

class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
  async update(id: string, token: string): Promise<void> {
    return;
  }
}

const makeSut = (): SutType => {
  const loadAccountByEmailRepository = new LoadAccountByEmailRepositoryStub();
  const hashComparerStub = new HashComparerStub();
  const tokenGeneratorStub = new TokenGeneratorStub();
  const updateAccessTokenRepositoryStub = new UpdateAccessTokenRepositoryStub();
  const sut = new DbAuthentication(
    loadAccountByEmailRepository,
    hashComparerStub,
    tokenGeneratorStub,
    updateAccessTokenRepositoryStub
  );
  return {
    sut,
    loadAccountByEmailRepository,
    hashComparerStub,
    tokenGeneratorStub,
    updateAccessTokenRepositoryStub,
  };
};

describe("DbAuthentication UseCase", () => {
  test("Should call LoadAccountByEmailRepository with correct email", async () => {
    const { sut, loadAccountByEmailRepository } = makeSut();
    const loadSpy = jest.spyOn(loadAccountByEmailRepository, "load");
    await sut.auth(fakeAuthentication);
    expect(loadSpy).toHaveBeenLastCalledWith(fakeAuthentication.email);
  });
  test("Should throw if LoadAccountByEmailRepository throws", async () => {
    const { sut, loadAccountByEmailRepository } = makeSut();

    jest
      .spyOn(loadAccountByEmailRepository, "load")
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error()))
      );

    const promise = sut.auth(fakeAuthentication);
    await expect(promise).rejects.toThrow();
  });
  test("Should return null if LoadAccountByEmailRepository returns null", async () => {
    const { sut, loadAccountByEmailRepository } = makeSut();
    jest.spyOn(loadAccountByEmailRepository, "load").mockReturnValue(null);
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
  test("Should call TokenGenerator with correct id", async () => {
    const { sut, tokenGeneratorStub } = makeSut();
    const generateSpy = jest.spyOn(tokenGeneratorStub, "generate");
    await sut.auth(fakeAuthentication);
    expect(generateSpy).toBeCalledWith(fakeAccount.id);
  });
  test("Should throw if TokenGenerator throws", async () => {
    const { sut, tokenGeneratorStub } = makeSut();
    jest
      .spyOn(tokenGeneratorStub, "generate")
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error()))
      );
    const promise = sut.auth(fakeAuthentication);
    await expect(promise).rejects.toThrow();
  });
  test("Should call TokenGenerator with correct id", async () => {
    const { sut } = makeSut();
    const token = await sut.auth(fakeAuthentication);
    expect(token).toBe(mockedToken);
  });
  test("Should call UpdateAccessTokenRepository with correct values", async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut();
    const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, "update");
    await sut.auth(fakeAuthentication);
    expect(updateSpy).toBeCalledWith(fakeAccount.id, mockedToken);
  });
  test("Should throw if UpdateAccessTokenRepository throws", async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut();
    jest
      .spyOn(updateAccessTokenRepositoryStub, "update")
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error()))
      );
    const promise = sut.auth(fakeAuthentication);
    await expect(promise).rejects.toThrow();
  });
});
