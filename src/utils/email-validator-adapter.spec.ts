import validator from "validator";
import { EmailValidatorAdapter } from "./email-validator-adapter";

jest.mock("validator", () => ({
  isEmail(): boolean {
    return true;
  },
}));

const makeSut = (): EmailValidatorAdapter => {
  return new EmailValidatorAdapter();
};

describe("EmailValidator Adapter", () => {
  test("Should return false if validator returns false", () => {
    const sut = makeSut();

    jest.spyOn(validator, "isEmail").mockReturnValueOnce(false);

    const isValid = sut.isValid("invalid@email.com");
    expect(isValid).toBeFalsy();
  });
  test("Should return true if validator returns true", () => {
    const sut = makeSut();
    const isValid = sut.isValid("valid@email.com");
    expect(isValid).toBeTruthy();
  });
  test("Should calll validator with correct email", () => {
    const anyEmail = "any@email.com";
    const sut = makeSut();
    sut.isValid(anyEmail);

    const isEmailSpy = jest.spyOn(validator, "isEmail");
    expect(isEmailSpy).toHaveBeenCalledWith(anyEmail);
  });
});
