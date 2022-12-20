import { InvalidParamError, MissingParamError } from "../../errors";
import {
  badRequest,
  ok,
  serverError,
  unauthorized,
} from "../../helpers/http-helper";
import { LoginController } from "./login";
import { Authentication, EmailValidator, HttpRequest } from "./login-protocols";

interface SutTypes {
  sut: LoginController;
  emailValidatorStub: EmailValidator;
  authenticationStub: Authentication;
}

const makeSut = (): SutTypes => {
  const emailValidatorStub = new EmailValidatorStub();
  const authenticationStub = new AuthenticationStub();
  const sut = new LoginController(emailValidatorStub, authenticationStub);
  return {
    sut,
    emailValidatorStub,
    authenticationStub,
  };
};

class EmailValidatorStub implements EmailValidator {
  isValid(email: string): boolean {
    return true;
  }
}

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
  test("Should return 400 if no email is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = { body: { password: "any", email: undefined } };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError("email")));
  });
  test("Should return 400 if no password is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = { body: { email: "any@email.com" } };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError("password")));
  });
  test("Should return 400 if an invalid email is provided", async () => {
    const { sut, emailValidatorStub } = makeSut();
    jest.spyOn(emailValidatorStub, "isValid").mockReturnValueOnce(false);
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new InvalidParamError("email")));
  });
  test("Should call email validator with correct email", async () => {
    const { sut, emailValidatorStub } = makeSut();
    const isValidSpy = jest.spyOn(emailValidatorStub, "isValid");
    await sut.handle(httpRequest);
    expect(isValidSpy).toHaveBeenCalledWith(httpRequest.body.email);
  });
  test("Should return 500 if EmailValidator throws", async () => {
    const { sut, emailValidatorStub } = makeSut();
    jest
      .spyOn(emailValidatorStub, "isValid")
      .mockImplementationOnce((email: string) => {
        throw new Error();
      });
    const response = await sut.handle(httpRequest);
    expect(response).toEqual(serverError(new Error()));
  });
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
});
