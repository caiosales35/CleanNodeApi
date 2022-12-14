import {
  CompareFieldsValidation,
  EmailValidation,
  RequiredFieldValidation,
  ValidationComposite,
} from "../../../presentation/helpers/validators";
import { EmailValidator } from "../../../presentation/protocols/email-validator";
import { Validation } from "../../../presentation/protocols/validation";
import { makeSingUpValidation } from "./singup-validation";

jest.mock("../../../presentation/helpers/validators/validation-composite");

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }
  return new EmailValidatorStub();
};

describe("SingUpValidation Factory", () => {
  test("Should call ValidationComposite with all validations", () => {
    makeSingUpValidation();

    const validations: Validation[] = [];
    for (const field of ["name", "email", "password", "passwordConfirmation"]) {
      validations.push(new RequiredFieldValidation(field));
    }
    validations.push(
      new CompareFieldsValidation("password", "passwordConfirmation")
    );
    validations.push(new EmailValidation("email", makeEmailValidator()));

    expect(ValidationComposite).toHaveBeenLastCalledWith(validations);
  });
});
