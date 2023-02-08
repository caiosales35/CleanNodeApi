import { badRequest, ok, serverError } from "../../helpers/http/http-helper";
import {
  AddAccount,
  Controller,
  HttpRequest,
  HttpResponse,
  Validation,
} from "./singup-controller-protocols";

export class SingUpController implements Controller {
  constructor(
    private readonly addAccount: AddAccount,
    private readonly validation: Validation
  ) {}

  async handle(httpResquest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpResquest.body);
      if (error) return badRequest(error);

      const { name, email, password } = httpResquest.body;
      const account = await this.addAccount.add({ name, email, password });
      return ok(account);
    } catch (error) {
      // console.error(error);
      return serverError(error);
    }
  }
}
