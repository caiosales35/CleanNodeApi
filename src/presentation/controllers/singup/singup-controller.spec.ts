import { MissingParamError, ServerError } from "../../errors";
import { badRequest, ok, serverError } from "../../helpers/http/http-helper";
import { SingUpController } from "./singup-controller";
import {
  AccountModel,
  AddAccount,
  AddAccountModel,
  HttpRequest,
  Validation,
} from "./singup-controller-protocols";

interface SutTypes {
  sut: SingUpController;
  addAccountStub: AddAccount;
  validationStub: Validation;
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add(account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = { ...account, id: "valid_id" } as AccountModel;
      return new Promise((resolve) => resolve(fakeAccount));
    }
  }
  return new AddAccountStub();
};

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(input: any): Error {
      return null;
    }
  }
  return new ValidationStub();
};

const makeSut = (): SutTypes => {
  const validationStub = makeValidation();
  const addAccountStub = makeAddAccount();
  const sut = new SingUpController(addAccountStub, validationStub);
  return { sut, addAccountStub, validationStub };
};

const makeFakeRequest = (): HttpRequest => {
  return {
    body: {
      name: "any name",
      email: "any@email.com",
      password: "any_password",
      passwordConfirmation: "any_password",
    },
  };
};

describe("SignUp Controller", () => {
  test("should return 500 if AddAccount throws", async () => {
    const { sut, addAccountStub } = makeSut();

    jest
      .spyOn(addAccountStub, "add")
      .mockImplementationOnce(async (account: AddAccountModel) => {
        return new Promise((resolve, reject) => reject(new Error()));
      });

    const httpRequest = makeFakeRequest();
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(serverError(new ServerError(null)));
  });
  test("should call AddAccount with correct values", async () => {
    const { sut, addAccountStub } = makeSut();

    const addSpy = jest.spyOn(addAccountStub, "add");

    const httpRequest = makeFakeRequest();
    sut.handle(httpRequest);
    expect(addSpy).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      email: httpRequest.body.email,
      password: httpRequest.body.password,
    });
  });
  test("should return 200 if valid data is provided", async () => {
    const { sut } = makeSut();

    const httpRequest = makeFakeRequest();
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(
      ok({
        ...httpRequest.body,
        id: "valid_id",
        passwordConfirmation: undefined,
      })
    );
  });
  test("should call Validation with correct values", async () => {
    const { sut, validationStub } = makeSut();

    const validateSpy = jest.spyOn(validationStub, "validate");

    const httpRequest = makeFakeRequest();
    sut.handle(httpRequest);
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body);
  });
  test("should return 400 if Validation returns an error", async () => {
    const { sut, validationStub } = makeSut();

    jest
      .spyOn(validationStub, "validate")
      .mockReturnValueOnce(new MissingParamError("any_field"));

    const httpRequest = makeFakeRequest();
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(
      badRequest(new MissingParamError("any_field"))
    );
  });
});
