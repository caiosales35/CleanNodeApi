import { InvalidParamError } from "../erros/invalid-param-error";
import { MissingParamError } from "../erros/missing-param-error";
import { EmailValidator } from "../protocols/email-validator";
import { SingUpController } from "./singup";

interface SutTypes {
  sut: SingUpController;
  emailValidatorStub: EmailValidator;
}

const makeSut = (): SutTypes => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }

  const emailValidatorStub = new EmailValidatorStub();
  const sut = new SingUpController(emailValidatorStub);
  return { sut, emailValidatorStub };
};

describe("SignUp Controller", () => {
  test("should return 400 if no name is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: undefined,
        email: "any@email.com",
        password: "any_password",
        passwordConfirmation: "any_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });
  test("should return 400 if no email is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any name",
        email: undefined,
        password: "any_password",
        passwordConfirmation: "any_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });
  test("should return 400 if no password is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any name",
        email: "any@email.com",
        password: undefined,
        passwordConfirmation: "any_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });
  test("should return 400 if no passwordConfirmation is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any name",
        email: "any@email.com",
        password: "any_password",
        passwordConfirmation: undefined,
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(
      new MissingParamError("passwordConfirmation")
    );
  });
  test("should return 400 if an invalid email is provided", () => {
    const { sut, emailValidatorStub } = makeSut();

    jest.spyOn(emailValidatorStub, "isValid").mockReturnValueOnce(false);

    const httpRequest = {
      body: {
        name: "any name",
        email: "invalid@email.com",
        password: "any_password",
        passwordConfirmation: "any_password",
      },
    };
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("email"));
  });
});
