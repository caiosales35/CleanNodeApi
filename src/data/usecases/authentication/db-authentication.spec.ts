import { AuthenticationModel } from "../../../domain/usecases/authentication";
import { LoadAccountByEmailRepository } from "../../protocols/load-account-by-email-repository";
import { AccountModel } from "../add-account/db-add-account-protocols";
import { DbAuthentication } from "./db-authentication";

interface SutType {
  sut: DbAuthentication;
  loadAccountByEmailRepository: LoadAccountByEmailRepositoryStub;
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

class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
  async load(email: string): Promise<AccountModel> {
    return new Promise((resolve) => resolve(fakeAccount));
  }
}

const makeSut = (): SutType => {
  const loadAccountByEmailRepository = new LoadAccountByEmailRepositoryStub();
  const sut = new DbAuthentication(loadAccountByEmailRepository);
  return { sut, loadAccountByEmailRepository };
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
});
