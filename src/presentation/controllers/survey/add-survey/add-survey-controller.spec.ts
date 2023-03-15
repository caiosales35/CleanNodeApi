import {
  badRequest,
  noContent,
  serverError,
} from "../../../helpers/http/http-helper";
import { AddSurveyController } from "./add-survey-controller";
import {
  AddSurvey,
  AddSurveyModel,
  HttpRequest,
  Validation,
} from "./add-survey-controller-protocols";

interface SutTypes {
  sut: AddSurveyController;
  addSurveyStub: AddSurveyStub;
  validationStub: ValidationStub;
}

const httpRequest: HttpRequest = {
  body: {
    question: "any string",
    answers: [
      {
        image: "url",
        answer: "any answer",
      },
    ],
  },
};

class AddSurveyStub implements AddSurvey {
  async add(data: AddSurveyModel): Promise<void> {
    return new Promise((resolve) => resolve());
  }
}

class ValidationStub implements Validation {
  validate(input: any): void | Error {
    return null;
  }
}

const makeSut = (): SutTypes => {
  const addSurveyStub = new AddSurveyStub();
  const validationStub = new ValidationStub();
  const sut = new AddSurveyController(validationStub, addSurveyStub);
  return { sut, validationStub, addSurveyStub };
};

describe("AddSurvey Controller", () => {
  test("Should call Validation with correct values", async () => {
    const { sut, validationStub } = makeSut();
    const validateSpy = jest.spyOn(validationStub, "validate");
    await sut.handle(httpRequest);
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body);
  });
  test("Should return 400 if Validation fails", async () => {
    const { sut, validationStub } = makeSut();
    jest.spyOn(validationStub, "validate").mockReturnValueOnce(new Error());
    const httpReponse = await sut.handle(httpRequest);
    expect(httpReponse).toEqual(badRequest(new Error()));
  });
  test("Should call AddSurvey with correct values", async () => {
    const { sut, addSurveyStub } = makeSut();
    const addSpy = jest.spyOn(addSurveyStub, "add");
    await sut.handle(httpRequest);
    expect(addSpy).toHaveBeenCalledWith(httpRequest.body);
  });
  test("Should return 500 if AddSurvey throws", async () => {
    const { sut, addSurveyStub } = makeSut();
    jest.spyOn(addSurveyStub, "add").mockRejectedValueOnce(new Error());
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(serverError(new Error()));
  });
  test("Should return 204 on success", async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(noContent());
  });
});
