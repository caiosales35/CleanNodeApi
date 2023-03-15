import {
  badRequest,
  noContent,
  serverError,
} from "../../../helpers/http/http-helper";
import {
  AddSurvey,
  Controller,
  HttpRequest,
  HttpResponse,
  Validation,
} from "./add-survey-controller-protocols";

export class AddSurveyController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly addSurvey: AddSurvey
  ) {}

  async handle(httpResquest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpResquest.body);
      if (error) return badRequest(error);
      await this.addSurvey.add({
        question: httpResquest.body.question,
        answers: httpResquest.body.answers,
      });
      return noContent();
    } catch (error) {
      return serverError(error);
    }
  }
}
