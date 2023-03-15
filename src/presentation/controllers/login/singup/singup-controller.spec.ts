import {
  DuplicatedEmailError,
  MissingParamError,
  ServerError,
} from "../../../errors";
import {
  badRequest,
  forbidden,
  ok,
  serverError,
} from "../../../helpers/http/http-helper";
import { SingUpController } from "./singup-controller";
import {
  AccountModel,
  AddAccount,
  AddAccountModel,
  Authentication,
  AuthenticationModel,
  HttpRequest,
  Validation,
} from "./singup-controller-protocols";

const any_token = "any_token";

interface SutTypes {
  sut: SingUpController;
  addAccountStub: AddAccount;
  validationStub: Validation;
  authenticationStub: Authentication;
}

class AuthenticationStub implements Authentication {
  async auth(authentication: AuthenticationModel): Promise<string> {
    return new Promise((resolve) => resolve(any_token));
  }
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
  const authenticationStub = new AuthenticationStub();
  const sut = new SingUpController(
    addAccountStub,
    validationStub,
    authenticationStub
  );
  return { sut, addAccountStub, validationStub, authenticationStub };
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
  test("should return 403 if addAccount returns null", async () => {
    const { sut, addAccountStub } = makeSut();

    jest
      .spyOn(addAccountStub, "add")
      .mockResolvedValueOnce(null as unknown as AccountModel);

    const httpRequest = makeFakeRequest();
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(forbidden(new DuplicatedEmailError()));
  });
  test("should return 200 if valid data is provided", async () => {
    const { sut } = makeSut();

    const httpRequest = makeFakeRequest();
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(ok({ accessToken: any_token }));
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
  test("Should call Authentication with correct values", async () => {
    const { sut, authenticationStub } = makeSut();
    const authSpy = jest.spyOn(authenticationStub, "auth");
    const httpRequest = makeFakeRequest();
    await sut.handle(httpRequest);
    expect(authSpy).toHaveBeenCalledWith({
      email: httpRequest.body.email,
      password: httpRequest.body.password,
    });
  });
  test("Should return 500 if Authentication throws", async () => {
    const { sut, authenticationStub } = makeSut();
    jest
      .spyOn(authenticationStub, "auth")
      .mockImplementationOnce(async (auth: AuthenticationModel) => {
        throw new Error();
      });

    const response = await sut.handle(makeFakeRequest());
    expect(response).toEqual(serverError(new Error()));
  });
});
