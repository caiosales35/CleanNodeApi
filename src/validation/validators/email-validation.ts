import { InvalidParamError } from "../../presentation/errors";
import { Validation } from "../../presentation/protocols/validation";
import { EmailValidator } from "../protocols/email-validator";

export class EmailValidation implements Validation {
  constructor(
    private readonly fieldName: string,
    private readonly emailValidator: EmailValidator
  ) {}

  validate(input: any): Error | void {
    const isValidEmail = this.emailValidator.isValid(input[this.fieldName]);
    if (!isValidEmail) {
      return new InvalidParamError(this.fieldName);
    }
  }
}
