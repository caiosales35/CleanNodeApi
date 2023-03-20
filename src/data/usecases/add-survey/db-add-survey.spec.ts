import { DbAddSurvey } from "./db-add-survey";
import { AddSurveyModel, AddSurveyRepository } from "./db-add-survey-protocols";

interface SutTypes {
  sut: DbAddSurvey;
  addSurveyRepositoryStub: AddSurveyRepository;
}

const fakeSurveyData: AddSurveyModel = {
  question: "any_question",
  answers: [{ image: "any_url", answer: "any_answer" }],
};

class AddSurveyRepositoryStub implements AddSurveyRepository {
  async add(surveyData: AddSurveyModel): Promise<void> {
    return new Promise((resolve) => resolve());
  }
}

const makeSut = (): SutTypes => {
  const addSurveyRepositoryStub = new AddSurveyRepositoryStub();
  const sut = new DbAddSurvey(addSurveyRepositoryStub);
  return {
    sut,
    addSurveyRepositoryStub,
  };
};

describe("DbAddSurvey Usecase", () => {
  test("Should call AddSurveyRepository with correct values", async () => {
    const { sut, addSurveyRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addSurveyRepositoryStub, "add");
    await sut.add(fakeSurveyData);
    expect(addSpy).toHaveBeenCalledWith(fakeSurveyData);
  });
  test("Should call AddSurveyRepository with correct values", async () => {
    const { sut, addSurveyRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addSurveyRepositoryStub, "add");
    await sut.add(fakeSurveyData);
    expect(addSpy).toHaveBeenCalledWith(fakeSurveyData);
  });
  test("Should throw if AddSurveyRepository throws", async () => {
    const { sut, addSurveyRepositoryStub } = makeSut();
    jest
      .spyOn(addSurveyRepositoryStub, "add")
      .mockReturnValue(new Promise((resolve, reject) => reject(new Error())));
    const promise = sut.add(fakeSurveyData);
    await expect(promise).rejects.toThrow();
  });
});
