import { InvalidParamError } from "../erros/invalid-param-error";
import { MissingParamError } from "../erros/missing-param-error";
import { badRequest } from "../helpers/http-helper";
import { Controller } from "../protocols/controller";
import { EmailValidator } from "../protocols/email-validator";
import { HttpRequest, HttpResponse } from "../protocols/http";

export class SingUpController implements Controller {
  private readonly emailValidator: EmailValidator;

  constructor(emailValidator: EmailValidator) {
    this.emailValidator = emailValidator;
  }

  handle(httpResquest: HttpRequest): HttpResponse {
    const requiredFields = [
      "name",
      "email",
      "password",
      "passwordConfirmation",
    ];
    for (const field of requiredFields) {
      if (!httpResquest.body[field]) {
        return badRequest(new MissingParamError(field));
      }
    }
    const isValidEmail = this.emailValidator.isValid(httpResquest.body.email);
    if (!isValidEmail) {
      return badRequest(new InvalidParamError("email"));
    }
  }
}
