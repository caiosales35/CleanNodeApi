import { MissingParamError } from "../erros/missing-param-error";
import { SingUpController } from "./singup";

describe("SignUp Controller", () => {
  test("should return 400 if no name is provided", () => {
    const sut = new SingUpController();
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
    const sut = new SingUpController();
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
    const sut = new SingUpController();
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
    const sut = new SingUpController();
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
});
