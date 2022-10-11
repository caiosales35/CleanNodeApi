import { SingUpController } from "./singup";

describe("SignUp Controller", () => {
  test("should return 400 if no nome is provided", () => {
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
    expect(httpResponse.body).toEqual(new Error("Missing param: name"));
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
    expect(httpResponse.body).toEqual(new Error("Missing param: email"));
  });
});
