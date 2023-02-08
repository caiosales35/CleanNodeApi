import { EmailValidator } from "../../controllers/singup/singup-controller-protocols";
import { InvalidParamError } from "../../errors";
import { EmailValidation } from "./email-validation";

interface SutTypes {
  sut: EmailValidation;
  emailValidatorStub: EmailValidator;
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }
  return new EmailValidatorStub();
};

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator();
  const sut = new EmailValidation("email", emailValidatorStub);
  return { sut, emailValidatorStub };
};

describe("Email Validation", () => {
  test("should call EmailValidator with correct email", () => {
    const { sut, emailValidatorStub } = makeSut();

    const isValidSpy = jest.spyOn(emailValidatorStub, "isValid");

    const httpRequest = { email: "any@email.com" };
    sut.validate(httpRequest);
    expect(isValidSpy).toHaveBeenCalledWith(httpRequest.email);
  });
  test("should throw if EmailValidator throws", () => {
    const { sut, emailValidatorStub } = makeSut();

    jest
      .spyOn(emailValidatorStub, "isValid")
      .mockImplementationOnce((email: string) => {
        throw new Error();
      });

    expect(sut.validate).toThrow();
  });
  test("Should return an error if EmailValidation returns false", () => {
    const { sut, emailValidatorStub } = makeSut();

    jest.spyOn(emailValidatorStub, "isValid").mockReturnValueOnce(false);
    const error = sut.validate({ email: "any@email.com" });
    expect(error).toEqual(new InvalidParamError("email"));
  });
});
