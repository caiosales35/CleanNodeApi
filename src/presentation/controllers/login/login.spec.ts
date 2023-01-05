import { MissingParamError } from "../../errors";
import {
  badRequest,
  ok,
  serverError,
  unauthorized,
} from "../../helpers/http-helper";
import { Validation } from "../singup/singup-protocols";
import { LoginController } from "./login";
import { Authentication, HttpRequest } from "./login-protocols";

interface SutTypes {
  sut: LoginController;
  authenticationStub: Authentication;
  validationStub: Validation;
}

const makeSut = (): SutTypes => {
  const validationStub = makeValidation();
  const authenticationStub = new AuthenticationStub();
  const sut = new LoginController(validationStub, authenticationStub);
  return { sut, validationStub, authenticationStub };
};

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(input: any): Error {
      return null;
    }
  }
  return new ValidationStub();
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

class AuthenticationStub implements Authentication {
  async auth(email: string, password: string): Promise<string> {
    return new Promise((resolve) => resolve(any_token));
  }
}

const httpRequest: HttpRequest = {
  body: { email: "any@email.com", password: "any" },
};

const any_token = "any_token";

describe("Login Controller", () => {
  test("Should call Authentication with correct values", async () => {
    const { sut, authenticationStub } = makeSut();
    const authSpy = jest.spyOn(authenticationStub, "auth");
    await sut.handle(httpRequest);
    expect(authSpy).toHaveBeenCalledWith(
      httpRequest.body.email,
      httpRequest.body.password
    );
  });
  test("Should return 401 if invalid credentials are provided", async () => {
    const { sut, authenticationStub } = makeSut();
    jest
      .spyOn(authenticationStub, "auth")
      .mockReturnValueOnce(new Promise((resolve) => resolve(null)));
    const response = await sut.handle(httpRequest);
    expect(response).toEqual(unauthorized());
  });
  test("Should return 500 if Authentication throws", async () => {
    const { sut, authenticationStub } = makeSut();
    jest
      .spyOn(authenticationStub, "auth")
      .mockImplementationOnce(async (email: string, password: string) => {
        throw new Error();
      });
    const response = await sut.handle(httpRequest);
    expect(response).toEqual(serverError(new Error()));
  });
  test("Should return 200 if valid credentials are provided", async () => {
    const { sut } = makeSut();

    const response = await sut.handle(httpRequest);
    expect(response).toEqual(ok({ accessToken: any_token }));
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
